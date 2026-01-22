const Imap = require('imap');
const { simpleParser } = require('mailparser');

class ImapService {
  async getLeboncoinEmails(account, maxResults = 50) {
    return new Promise((resolve, reject) => {
      const imap = new Imap({
        user: account.imapEmail,
        password: account.imapPassword,
        host: 'imap.gmail.com',
        port: 993,
        tls: true,
        tlsOptions: { rejectUnauthorized: false }
      });

      const emails = [];
      let fetchCompleted = false;

      imap.once('ready', () => {
        console.log(`📧 Connexion IMAP établie pour ${account.imapEmail}`);
        
        imap.openBox('INBOX', true, (err, box) => {
          if (err) {
            imap.end();
            return reject(err);
          }

          // Rechercher les emails de Leboncoin
          // Syntaxe IMAP correcte : critères de recherche dans un tableau
          imap.search([['FROM', 'leboncoin.fr']], (err, results) => {
            if (err) {
              imap.end();
              return reject(err);
            }

            if (!results || results.length === 0) {
              console.log(`ℹ️  Aucun email Leboncoin trouvé pour ${account.imapEmail}`);
              imap.end();
              return resolve([]);
            }

            console.log(`📬 ${results.length} email(s) Leboncoin trouvé(s) pour ${account.imapEmail}`);

            // Limiter le nombre de résultats et prendre les plus récents
            const fetchResults = results.slice(-maxResults);
            const fetch = imap.fetch(fetchResults, {
              bodies: '',
              struct: true
            });

            let processedCount = 0;

            fetch.on('message', (msg, seqno) => {
              msg.on('body', (stream, info) => {
                simpleParser(stream, async (err, parsed) => {
                  if (err) {
                    console.error('Erreur parsing email:', err);
                    return;
                  }

                  const email = this.parseEmail(parsed, account);
                  emails.push(email);
                  processedCount++;

                  // Vérifier si tous les emails ont été traités
                  if (processedCount === fetchResults.length && !fetchCompleted) {
                    fetchCompleted = true;
                    imap.end();
                  }
                });
              });
            });

            fetch.once('error', (err) => {
              console.error('Erreur fetch:', err);
              imap.end();
              reject(err);
            });

            fetch.once('end', () => {
              console.log(`✅ Fin de la récupération pour ${account.imapEmail}`);
              // Attendre un peu pour s'assurer que tous les emails sont parsés
              setTimeout(() => {
                if (!fetchCompleted) {
                  fetchCompleted = true;
                  imap.end();
                }
              }, 2000);
            });
          });
        });
      });

      imap.once('error', (err) => {
        console.error(`❌ Erreur IMAP pour ${account.imapEmail}:`, err.message);
        reject(err);
      });

      imap.once('end', () => {
        console.log(`🔌 Connexion IMAP fermée pour ${account.imapEmail}`);
        resolve(emails);
      });

      imap.connect();
    });
  }

  parseEmail(parsed, account) {
    const body = parsed.html || parsed.text || '';
    const subject = parsed.subject || 'Sans sujet';
    
    // Extraire le lien Leboncoin
    const leboncoinUrl = this.extractLeboncoinUrl(body);
    
    // Extraire l'ID du compte si possible
    const accountId = this.extractAccountId(body, subject);
    
    // Catégoriser l'email
    const category = this.categorizeEmail(subject, body);

    return {
      id: parsed.messageId || `${Date.now()}-${Math.random()}`,
      subject: subject,
      from: parsed.from?.text || '',
      date: parsed.date || new Date(),
      body: body,
      accountEmail: account.imapEmail,
      leboncoinUrl: leboncoinUrl,
      accountId: accountId,
      snippet: (parsed.text || '').substring(0, 200).replace(/\n/g, ' '),
      lbcPassword: account.lbcPassword,
      category: category.type,
      categoryLabel: category.label,
      categoryIcon: category.icon
    };
  }

  categorizeEmail(subject, body) {
    const subjectLower = subject.toLowerCase();
    const bodyLower = body.toLowerCase();

    // 1. Messages / Conversations
    if (
      subjectLower.includes('nouveau message') ||
      subjectLower.includes('vous avez reçu un message') ||
      subjectLower.includes('a répondu') ||
      subjectLower.includes('message de') ||
      bodyLower.includes('vous a envoyé un message') ||
      bodyLower.includes('nouvelle conversation')
    ) {
      return {
        type: 'message',
        label: 'Message reçu',
        icon: '💬'
      };
    }

    // 2. Mise en ligne d'annonce
    if (
      subjectLower.includes('votre annonce est en ligne') ||
      subjectLower.includes('annonce publiée') ||
      subjectLower.includes('annonce validée') ||
      subjectLower.includes('mise en ligne') ||
      bodyLower.includes('votre annonce est maintenant visible') ||
      bodyLower.includes('annonce a été publiée')
    ) {
      return {
        type: 'published',
        label: 'Annonce publiée',
        icon: '✅'
      };
    }

    // 3. Suppression d'annonce
    if (
      subjectLower.includes('annonce supprimée') ||
      subjectLower.includes('suppression de votre annonce') ||
      subjectLower.includes('annonce retirée') ||
      bodyLower.includes('votre annonce a été supprimée') ||
      bodyLower.includes('annonce a été retirée')
    ) {
      return {
        type: 'deleted',
        label: 'Annonce supprimée',
        icon: '🗑️'
      };
    }

    // 4. Annonce refusée / Modération
    if (
      subjectLower.includes('annonce refusée') ||
      subjectLower.includes('annonce non conforme') ||
      subjectLower.includes('annonce rejetée') ||
      subjectLower.includes('modération') ||
      subjectLower.includes('non validée') ||
      bodyLower.includes('votre annonce a été refusée') ||
      bodyLower.includes('ne peut pas être publiée') ||
      bodyLower.includes('non conforme')
    ) {
      return {
        type: 'rejected',
        label: 'Annonce refusée',
        icon: '❌'
      };
    }

    // 5. Autres types possibles
    if (
      subjectLower.includes('expir') ||
      bodyLower.includes('va expirer')
    ) {
      return {
        type: 'expiring',
        label: 'Annonce expire bientôt',
        icon: '⏰'
      };
    }

    // Type par défaut
    return {
      type: 'other',
      label: 'Autre',
      icon: '📧'
    };
  }

  extractLeboncoinUrl(body) {
    // Chercher les URLs Leboncoin dans le HTML ou texte
    const urlRegex = /https?:\/\/[a-z0-9]+\.leboncoin\.fr\/[^\s"<>'\)]+/gi;
    const matches = body.match(urlRegex);
    
    if (matches && matches.length > 0) {
      // Filtrer les URLs pour exclure les images et autres ressources
      const validUrls = matches.filter(url => {
        const lowerUrl = url.toLowerCase();
        // Exclure les images et fichiers statiques
        if (lowerUrl.match(/\.(png|jpg|jpeg|gif|svg|css|js|ico|webp)(\?|$)/i)) {
          return false;
        }
        // Exclure les URLs de tracking et images
        if (lowerUrl.includes('/emails_contact/') || 
            lowerUrl.includes('/static/') ||
            lowerUrl.includes('/assets/')) {
          return false;
        }
        return true;
      });

      // Prioriser les URLs importantes (annonces, messages, compte)
      const priorityUrls = validUrls.filter(url => {
        const lowerUrl = url.toLowerCase();
        return lowerUrl.includes('/ad/') || 
               lowerUrl.includes('/messages') || 
               lowerUrl.includes('/compte') ||
               lowerUrl.includes('/dashboard') ||
               lowerUrl.includes('/mes-annonces') ||
               lowerUrl.match(/\/[a-z_]+\/\d+\.htm/); // Format annonce classique
      });

      // Retourner l'URL prioritaire ou la première URL valide
      const finalUrl = priorityUrls.length > 0 ? priorityUrls[0] : validUrls[0];
      
      if (finalUrl) {
        return finalUrl.replace(/['"\)]+$/, '').trim();
      }
    }
    
    return null;
  }

  extractAccountId(body, subject) {
    // Tenter d'extraire l'ID du compte depuis le body ou le subject
    const idRegex = /(?:compte|account|id|profil)[\s:]*([a-zA-Z0-9_-]+)/i;
    const match = body.match(idRegex) || (subject && subject.match(idRegex));
    return match ? match[1] : null;
  }

  async getAllLeboncoinEmails(accounts, maxResults = 50) {
    const allEmails = [];
    
    console.log(`🔄 Récupération des emails pour ${accounts.length} compte(s)...`);
    
    for (const account of accounts) {
      try {
        const emails = await this.getLeboncoinEmails(account, maxResults);
        allEmails.push(...emails);
      } catch (error) {
        console.error(`❌ Erreur pour ${account.imapEmail}:`, error.message);
      }
    }

    console.log(`✅ Total: ${allEmails.length} email(s) récupéré(s)`);

    // Trier par date (plus récent en premier)
    return allEmails.sort((a, b) => new Date(b.date) - new Date(a.date));
  }
}

module.exports = new ImapService();
