const puppeteer = require('puppeteer');

class LeboncoinService {
  constructor() {
    this.browser = null;
  }

  // Vérifier si la page est encore attachée et utilisable
  async isPageValid(page) {
    try {
      if (!page || page.isClosed()) {
        return false;
      }
      // Essayer d'obtenir l'URL pour vérifier que la page est accessible
      await page.url();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Délai aléatoire pour simuler un comportement humain
  async randomDelay(min = 1000, max = 3000) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    console.log(`⏱️  Délai humain: ${delay}ms`);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  // Délai court pour les actions rapides
  async shortDelay() {
    await this.randomDelay(500, 1500);
  }

  // Délai moyen pour les actions normales
  async mediumDelay() {
    await this.randomDelay(1500, 3000);
  }

  // Délai long pour les chargements de page
  async longDelay() {
    await this.randomDelay(2000, 4000);
  }

  async initBrowser() {
    if (!this.browser) {
      console.log('🌐 Démarrage du navigateur...');
      
      // Configuration par défaut
      const launchOptions = {
        headless: false,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-blink-features=AutomationControlled',
          '--disable-web-security',
          '--disable-features=IsolateOrigins,site-per-process'
        ],
        defaultViewport: {
          width: 1280,
          height: 800
        }
      };
      
      // Essayer de trouver Chrome/Chromium automatiquement
      try {
        // Méthode 1 : Utiliser le Chrome de Puppeteer (si installé)
        const executablePath = puppeteer.executablePath();
        if (executablePath) {
          console.log('✅ Chrome trouvé via Puppeteer:', executablePath);
          launchOptions.executablePath = executablePath;
        }
      } catch (error) {
        console.log('⚠️  Chrome Puppeteer non trouvé, recherche d\'un Chrome système...');
        
        // Méthode 2 : Chercher Chrome dans les emplacements Windows courants
        const fs = require('fs');
        const path = require('path');
        
        const possibleChromePaths = [
          // Chrome système (Program Files)
          'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
          'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
          // Chrome utilisateur
          path.join(process.env.LOCALAPPDATA || '', 'Google\\Chrome\\Application\\chrome.exe'),
          // Edge (compatible avec Puppeteer)
          'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
          'C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe',
        ];
        
        for (const chromePath of possibleChromePaths) {
          if (chromePath && fs.existsSync(chromePath)) {
            console.log('✅ Chrome système trouvé:', chromePath);
            launchOptions.executablePath = chromePath;
            break;
          }
        }
        
        // Si aucun Chrome n'est trouvé, lancer sans executablePath
        // Puppeteer essaiera de télécharger Chrome automatiquement
        if (!launchOptions.executablePath) {
          console.log('⚠️  Aucun Chrome trouvé. Puppeteer va essayer de télécharger Chrome automatiquement...');
          console.log('💡 Si cela échoue, installez Chrome manuellement ou exécutez: npx puppeteer browsers install chrome');
        }
      }
      
      try {
        this.browser = await puppeteer.launch(launchOptions);
        console.log('✅ Navigateur démarré');
      } catch (error) {
        console.error('❌ Erreur lors du démarrage du navigateur:', error.message);
        
        // Message d'erreur plus clair pour l'utilisateur
        if (error.message.includes('Could not find Chrome')) {
          throw new Error(
            'Chrome n\'a pas été trouvé. Veuillez installer Chrome manuellement ou exécuter dans le dossier app:\n' +
            '  npx puppeteer browsers install chrome\n\n' +
            'Ou installez Google Chrome depuis: https://www.google.com/chrome/'
          );
        }
        throw error;
      }
    }
    return this.browser;
  }

  // Analyser l'état complet de la page (captcha, popup, champs de connexion, etc.)
  async analyzePageState(page) {
    try {
      const pageState = await page.evaluate(() => {
        // Fonction helper pour vérifier la visibilité
        const isVisible = (element) => {
          if (!element) return false;
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);
          return rect.width > 0 && 
                 rect.height > 0 && 
                 style.display !== 'none' && 
                 style.visibility !== 'hidden' &&
                 parseFloat(style.opacity) > 0;
        };

        // 1. VÉRIFIER LE CAPTCHA
        const iframes = Array.from(document.querySelectorAll('iframe'));
        const captchaIframe = iframes.find(iframe => {
          const src = iframe.src.toLowerCase();
          const title = (iframe.title || '').toLowerCase();
          return src.includes('recaptcha') || 
                 src.includes('hcaptcha') ||
                 src.includes('captcha') ||
                 title.includes('captcha') ||
                 title.includes('recaptcha');
        });

        const captchaDiv = document.querySelector(
          '[class*="captcha" i], [id*="captcha" i], ' +
          '[class*="recaptcha" i], [id*="recaptcha" i], ' +
          '[class*="hcaptcha" i], [id*="hcaptcha" i]'
        );

        const hasCaptcha = (captchaIframe && isVisible(captchaIframe)) || 
                          (captchaDiv && isVisible(captchaDiv));

        // 2. VÉRIFIER LA POPUP DE COOKIES
        const buttons = Array.from(document.querySelectorAll('button, a, div[role="button"], [role="link"]'));
        const normalizeText = (text) => {
          if (!text) return '';
          return text.toLowerCase()
            .replace(/[\s\n\r\t]+/g, ' ')
            .replace(/→|>|»/g, '')
            .trim();
        };

        const visibleButtons = buttons.filter(isVisible);
        
        const cookieButton = visibleButtons.find(btn => {
          const text = normalizeText(btn.textContent);
          return text.includes('continuer sans') || 
                 text.includes('continue without') ||
                 (text.includes('accepter') && (text.includes('fermer') || text.includes('close'))) ||
                 text.includes('accepter et fermer') ||
                 text.includes('accepter & fermer') ||
                 text.includes('tout accepter') ||
                 text.includes("j'accepte") ||
                 text.includes('accept all');
        });

        const hasCookiePopup = !!cookieButton;
        const cookieButtonText = cookieButton ? cookieButton.textContent.trim().substring(0, 40) : null;

        // 3. VÉRIFIER LE BOUTON "SE CONNECTER" (header)
        const loginHeaderButton = visibleButtons.find(btn => {
          const text = normalizeText(btn.textContent);
          return text === 'se connecter' || 
                 text === 'connexion' || 
                 text.includes('me connecter') ||
                 text === 'login';
        });

        const hasLoginButton = !!loginHeaderButton;

        // 4. VÉRIFIER LES CHAMPS DE CONNEXION
        const emailField = document.querySelector('input[type="email"], input[name="email"]');
        const passwordField = document.querySelector('input[type="password"], input[name="password"]');
        
        const hasEmailField = emailField && isVisible(emailField);
        const hasPasswordField = passwordField && isVisible(passwordField);

        // 5. VÉRIFIER SI ON EST CONNECTÉ
        const isLoggedIn = document.body.textContent.includes('Mon compte') ||
                          document.body.textContent.includes('Se déconnecter') ||
                          document.querySelector('[href*="/compte"]') !== null;

        // 6. VÉRIFIER L'URL
        const currentUrl = window.location.href;
        const isLoginPage = currentUrl.includes('/se-connecter') ||
                           currentUrl.includes('/connexion') ||
                           currentUrl.includes('/login');

        return {
          hasCaptcha,
          hasCookiePopup,
          cookieButtonText,
          hasLoginButton,
          hasEmailField,
          hasPasswordField,
          isLoggedIn,
          isLoginPage,
          url: currentUrl
        };
      });

      return pageState;
    } catch (error) {
      console.log('⚠️  Erreur lors de l\'analyse de la page:', error.message);
      return {
        hasCaptcha: false,
        hasCookiePopup: false,
        hasLoginButton: false,
        hasEmailField: false,
        hasPasswordField: false,
        isLoggedIn: false,
        isLoginPage: false,
        error: error.message
      };
    }
  }

  // Détecter la présence d'un captcha sur la page (version simplifiée pour compatibilité)
  async detectCaptcha(page) {
    const state = await this.analyzePageState(page);
    return { detected: state.hasCaptcha };
  }

  // Attendre que l'utilisateur résolve le captcha
  async waitForCaptchaResolution(page, maxWaitTime = 120000) {
    console.log('🤖 Captcha détecté ! En attente de la résolution par l\'utilisateur...');
    console.log('⏳ Vous avez jusqu\'à 2 minutes pour résoudre le captcha');
    
    const startTime = Date.now();
    let attempts = 0;
    
    while (Date.now() - startTime < maxWaitTime) {
      attempts++;
      
      // Vérifier toutes les 2 secondes si le captcha est toujours présent
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const captchaInfo = await this.detectCaptcha(page).catch(() => ({ detected: false }));
      
      if (!captchaInfo.detected) {
        console.log('✅ Captcha résolu ! Reprise du processus...');
        console.log('⏳ Attente de stabilisation de la page (5 secondes)...');
        
        // Attente prolongée pour laisser le temps à la page de se stabiliser
        // et aux popups (cookies, etc.) d'apparaître
        await new Promise(resolve => setTimeout(resolve, 5000));
        
        // Faire 3 tentatives de détection de la popup avec délai entre chaque
        console.log('🍪 Recherche de la popup de cookies (tentative 1/3)...');
        await this.handleCookieConsent(page);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('🍪 Recherche de la popup de cookies (tentative 2/3)...');
        await this.handleCookieConsent(page);
        
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        console.log('🍪 Recherche de la popup de cookies (tentative 3/3)...');
        await this.handleCookieConsent(page);
        
        console.log('✅ Traitement post-captcha terminé, reprise du processus');
        return true;
      }
      
      // Afficher un message toutes les 10 tentatives (20 secondes)
      if (attempts % 10 === 0) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        const remaining = Math.floor((maxWaitTime - (Date.now() - startTime)) / 1000);
        console.log(`⏳ Toujours en attente... (${elapsed}s écoulées, ${remaining}s restantes)`);
      }
    }
    
    // Timeout atteint
    console.log('⚠️  Temps d\'attente maximum dépassé pour la résolution du captcha');
    throw new Error('Captcha non résolu dans le temps imparti (2 minutes)');
  }

  // Gérer la popup de cookies/consentement
  async handleCookieConsent(page) {
    try {
      // Attendre un peu avant de chercher la popup
      await this.randomDelay(1000, 2000);

      const consentHandled = await page.evaluate(() => {
        // Chercher les boutons de consentement (y compris dans les iframes et shadow DOM)
        const buttons = Array.from(document.querySelectorAll('button, a, div[role="button"], [role="link"]'));
        
        // Fonction pour normaliser le texte (enlever espaces, retours à la ligne, flèches)
        const normalizeText = (text) => {
          if (!text) return '';
          return text.toLowerCase()
            .replace(/[\s\n\r\t]+/g, ' ')
            .replace(/→|>|»/g, '')
            .trim();
        };

        // Fonction pour vérifier si un bouton est visible
        const isVisible = (element) => {
          if (!element) return false;
          const rect = element.getBoundingClientRect();
          const style = window.getComputedStyle(element);
          return rect.width > 0 && 
                 rect.height > 0 && 
                 style.display !== 'none' && 
                 style.visibility !== 'hidden' &&
                 parseFloat(style.opacity) > 0;
        };

        // Filtrer les boutons visibles
        const visibleButtons = buttons.filter(isVisible);

        // Chercher "Continuer sans accepter" en priorité
        const continueButton = visibleButtons.find(btn => {
          const text = normalizeText(btn.textContent);
          return text.includes('continuer sans') || 
                 text.includes('continue without');
        });

        // Chercher "Accepter & Fermer", "Accepter et fermer", "Tout accepter", "J'accepte"
        const acceptButton = visibleButtons.find(btn => {
          const text = normalizeText(btn.textContent);
          return (text.includes('accepter') && (text.includes('fermer') || text.includes('close'))) ||
                 text.includes('accepter et fermer') ||
                 text.includes('accepter & fermer') ||
                 text.includes('tout accepter') ||
                 text.includes("j'accepte") ||
                 text.includes('accept all') ||
                 text.includes('accept & close') ||
                 text === 'accepter';
        });

        // Préférer "Continuer sans accepter" pour être plus discret
        if (continueButton) {
          const buttonText = continueButton.textContent.trim().substring(0, 40);
          continueButton.click();
          return { success: true, type: 'continue_without', text: buttonText };
        } else if (acceptButton) {
          const buttonText = acceptButton.textContent.trim().substring(0, 40);
          acceptButton.click();
          return { success: true, type: 'accept', text: buttonText };
        }
        return { success: false };
      }).catch(err => {
        console.log('⚠️  Erreur lors de l\'évaluation de la popup:', err.message);
        return { success: false };
      });

      if (consentHandled && consentHandled.success) {
        console.log(`✅ Popup de cookies gérée: "${consentHandled.text}" (type: ${consentHandled.type})`);
        // Délai plus long après avoir cliqué pour laisser la popup se fermer
        await this.randomDelay(2500, 4000);
      } else {
        console.log('ℹ️  Aucune popup de cookies visible détectée');
      }
    } catch (error) {
      console.log('ℹ️  Erreur lors de la gestion des cookies (ignorée):', error.message);
    }
  }

  // Système intelligent qui s'adapte à l'état de la page
  async smartNavigationAndLogin(page, email, password) {
    console.log('🧠 Démarrage du système de navigation intelligent...');
    
    let attempts = 0;
    const maxAttempts = 20; // Maximum 20 cycles pour éviter les boucles infinies
    
    try {
      while (attempts < maxAttempts) {
        attempts++;
        console.log(`\n📊 Analyse de la page (cycle ${attempts}/${maxAttempts})...`);
        
        // Petit délai pour observer la page
        await this.randomDelay(1500, 2500);
        
        // Analyser l'état actuel de la page
        const state = await this.analyzePageState(page);
        
        console.log(`   📍 URL: ${state.url}`);
        console.log(`   🤖 Captcha: ${state.hasCaptcha ? '✅ Détecté' : '❌ Non'}`);
        console.log(`   🍪 Popup cookies: ${state.hasCookiePopup ? '✅ Détectée' : '❌ Non'}`);
        console.log(`   🔐 Bouton "Se connecter": ${state.hasLoginButton ? '✅ Présent' : '❌ Non'}`);
        console.log(`   📧 Champ email: ${state.hasEmailField ? '✅ Visible' : '❌ Non'}`);
        console.log(`   🔑 Champ mot de passe: ${state.hasPasswordField ? '✅ Visible' : '❌ Non'}`);
        console.log(`   👤 Connecté: ${state.isLoggedIn ? '✅ Oui' : '❌ Non'}`);
        
        // PRIORITÉ 1 : GÉRER LE CAPTCHA
        if (state.hasCaptcha) {
          console.log('🎯 Action: Attente de résolution du captcha...');
          await this.waitForCaptchaResolution(page);
          continue; // Recommencer l'analyse après résolution
        }
        
        // PRIORITÉ 2 : GÉRER LA POPUP DE COOKIES
        if (state.hasCookiePopup) {
          console.log(`🎯 Action: Clic sur "${state.cookieButtonText}"...`);
          await this.handleCookieConsent(page);
          continue; // Recommencer l'analyse
        }
        
        // PRIORITÉ 3 : VÉRIFIER SI DÉJÀ CONNECTÉ
        if (state.isLoggedIn) {
          console.log('✅ Utilisateur déjà connecté !');
          return false; // Pas de connexion nécessaire
        }
        
        // PRIORITÉ 4 : CLIQUER SUR "SE CONNECTER" SI PRÉSENT
        if (state.hasLoginButton && !state.isLoginPage) {
          console.log('🎯 Action: Clic sur le bouton "Se connecter"...');
          await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
            const loginBtn = buttons.find(btn => {
              const text = btn.textContent.toLowerCase().trim();
              return text === 'se connecter' || text === 'connexion' || text.includes('me connecter');
            });
            if (loginBtn) loginBtn.click();
          });
          
          await page.waitForNavigation({ 
            waitUntil: 'networkidle2', 
            timeout: 10000 
          }).catch(() => console.log('⚠️  Pas de navigation après le clic'));
          
          continue; // Recommencer l'analyse sur la nouvelle page
        }
        
        // PRIORITÉ 5 : REMPLIR LE CHAMP EMAIL
        if (state.hasEmailField && !state.hasPasswordField) {
          console.log('🎯 Action: Saisie de l\'email...');
          await page.click('input[type="email"], input[name="email"]');
          await this.randomDelay(300, 700);
          
          // Effacer le champ
          await page.evaluate(() => {
            const input = document.querySelector('input[type="email"], input[name="email"]');
            if (input) input.value = '';
          });
          
          await this.randomDelay(400, 900);
          await page.type('input[type="email"], input[name="email"]', email, { 
            delay: Math.floor(Math.random() * 100) + 80 
          });
          
          await this.randomDelay(800, 1500);
          
          // Cliquer sur "Continuer"
          console.log('🖱️  Clic sur "Continuer"...');
          await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const continueBtn = buttons.find(btn => {
              const text = btn.textContent.toLowerCase().trim();
              return text === 'continuer' || text === 'continue' || btn.type === 'submit';
            });
            if (continueBtn) continueBtn.click();
          });
          
          await this.longDelay();
          continue; // Recommencer l'analyse
        }
        
        // PRIORITÉ 6 : REMPLIR LE MOT DE PASSE ET SE CONNECTER
        if (state.hasPasswordField) {
          console.log('🎯 Action: Saisie du mot de passe...');
          await page.click('input[type="password"]');
          await this.randomDelay(400, 900);
          
          await page.type('input[type="password"]', password, { 
            delay: Math.floor(Math.random() * 100) + 80 
          });
          
          await this.randomDelay(1000, 2000);
          
          // Cliquer sur le bouton de connexion
          console.log('🖱️  Clic sur "Se connecter"...');
          await page.evaluate(() => {
            const buttons = Array.from(document.querySelectorAll('button'));
            const loginBtn = buttons.find(btn => {
              const text = btn.textContent.toLowerCase().trim();
              return text === 'se connecter' || text === 'connexion' || btn.type === 'submit';
            });
            if (loginBtn) loginBtn.click();
          });
          
          console.log('⏳ Attente de la connexion...');
          await page.waitForNavigation({ 
            waitUntil: 'networkidle2', 
            timeout: 30000 
          }).catch(() => console.log('⚠️  Timeout de navigation (peut être normal)'));
          
          await this.longDelay();
          
          // Vérifier si connecté
          const finalState = await this.analyzePageState(page);
          if (finalState.isLoggedIn) {
            console.log('✅ Connexion réussie !');
            return true;
          }
          
          continue; // Recommencer l'analyse si pas encore connecté
        }
        
        // Si aucune action n'a été prise, on est probablement connecté ou dans un état inconnu
        console.log('ℹ️  Aucune action nécessaire - fin du processus');
        break;
      }
      
      if (attempts >= maxAttempts) {
        console.log('⚠️  Nombre maximum de tentatives atteint');
      }
      
      return false;
      
    } catch (error) {
      console.error('❌ Erreur dans le système de navigation intelligent:', error.message);
      throw error;
    }
  }

  // Ancienne fonction pour compatibilité - redirige vers le nouveau système intelligent
  async detectAndLogin(page, email, password) {
    return await this.smartNavigationAndLogin(page, email, password);
  }

  async openEmailLink(url, email, password, accountId = null, category = null) {
    let page;
    
    try {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🔗 OUVERTURE D'UN EMAIL LEBONCOIN`);
      console.log(`📧 Email: ${email}`);
      console.log(`🔗 URL: ${url}`);
      console.log(`📂 Catégorie: ${category || 'non spécifiée'}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
      
      const browser = await this.initBrowser();
      page = await browser.newPage();
      
      // Déterminer si on doit se connecter automatiquement
      const shouldAutoLogin = category === 'message'; // Seulement pour les messages
      const skipLogin = ['published', 'deleted', 'rejected'].includes(category);
      
      console.log(`🔗 Ouverture du lien de l'email: ${url}`);
      if (skipLogin) {
        console.log(`ℹ️  Catégorie "${category}": ouverture sans connexion automatique`);
      }
      
      // Délai initial avant d'ouvrir le lien
      await this.shortDelay();
      
      // ÉTAPE 1 : Aller sur le lien de l'email
      try {
        await page.goto(url, {
          waitUntil: 'networkidle2',
          timeout: 30000
        });
        console.log(`📍 Page chargée: ${page.url()}`);
      } catch (gotoError) {
        if (gotoError.message.includes('timeout')) {
          console.warn('⚠️  Timeout lors du chargement initial, tentative avec waitUntil: load');
          await page.goto(url, {
            waitUntil: 'load',
            timeout: 30000
          });
        } else {
          throw gotoError;
        }
      }
      
      // Délai d'observation de la page
      await this.mediumDelay();
      
      // Vérifier que la page est toujours valide
      if (!(await this.isPageValid(page))) {
        throw new Error('La page a été fermée après le chargement initial');
      }
      
      // ÉTAPE 1.5 : Vérifier la présence d'un captcha après le chargement
      let captchaInfo = await this.detectCaptcha(page);
      if (captchaInfo.detected) {
        await this.waitForCaptchaResolution(page);
      }
      
      // ÉTAPE 2 : Gérer la popup de cookies si présente
      await this.handleCookieConsent(page);
      
      // ÉTAPE 2.5 : Vérifier à nouveau la présence d'un captcha après la gestion des cookies
      captchaInfo = await this.detectCaptcha(page);
      if (captchaInfo.detected) {
        await this.waitForCaptchaResolution(page);
      }
      
      // ÉTAPE 3 : Détecter si connexion nécessaire et se connecter (seulement pour les messages)
      let wasLoggedIn = false;
      
      if (shouldAutoLogin) {
        console.log(`🔐 Connexion automatique activée pour la catégorie "message"`);
        
        // Vérifier que la page est toujours valide avant de tenter la connexion
        if (!(await this.isPageValid(page))) {
          throw new Error('La page a été fermée avant la tentative de connexion');
        }
        
        wasLoggedIn = await this.detectAndLogin(page, email, password);
      } else if (skipLogin) {
        console.log(`✅ Page ouverte sans connexion automatique`);
        // Pour ces catégories, on s'arrête ici
        return {
          success: true,
          url: page.url(),
          category: category
        };
      } else {
        // Pour les autres catégories (ou si pas de catégorie), comportement par défaut
        wasLoggedIn = await this.detectAndLogin(page, email, password);
      }
      
      if (wasLoggedIn) {
        // Si on s'est connecté, retourner sur le lien de l'email
        console.log(`🔗 Retour sur le lien de l'email (maintenant connecté)...`);
        
        // Délai avant de retourner sur le lien
        await this.longDelay();
        
        try {
          await page.goto(url, {
            waitUntil: 'networkidle2',
            timeout: 30000
          });
        } catch (gotoError) {
          if (gotoError.message.includes('timeout')) {
            console.warn('⚠️  Timeout lors du retour, tentative avec waitUntil: load');
            await page.goto(url, {
              waitUntil: 'load',
              timeout: 30000
            });
          } else if (gotoError.message.includes('detached Frame')) {
            console.error('❌ La page a été fermée. Abandon de l\'opération.');
            throw new Error('La page a été fermée pendant la navigation. Veuillez réessayer.');
          } else {
            throw gotoError;
          }
        }
        
        // Observer la page après retour
        await this.mediumDelay();
        
        // Vérifier la présence d'un captcha
        captchaInfo = await this.detectCaptcha(page);
        if (captchaInfo.detected) {
          await this.waitForCaptchaResolution(page);
        }
        
        // Vérifier la popup de cookies après le retour sur le lien
        console.log('🍪 Vérification de la popup de cookies après retour...');
        await this.randomDelay(2000, 3000);
        
        // Faire 3 tentatives de détection
        for (let i = 1; i <= 3; i++) {
          console.log(`🍪 Recherche de la popup (tentative ${i}/3)...`);
          await this.handleCookieConsent(page);
          if (i < 3) {
            await this.randomDelay(1500, 2500);
          }
        }
      }

      // ÉTAPE 4 : Vérification finale de la popup de cookies (même si pas de reconnexion)
      console.log('🍪 Vérification finale de la popup de cookies...');
      await this.randomDelay(1500, 2500);
      
      for (let i = 1; i <= 2; i++) {
        console.log(`🍪 Recherche finale (tentative ${i}/2)...`);
        await this.handleCookieConsent(page);
        if (i < 2) {
          await this.randomDelay(1500, 2500);
        }
      }

      // ÉTAPE 5 : Si un accountId est fourni ET qu'on n'est pas déjà sur une page du compte
      if (accountId) {
        const currentUrl = page.url();
        const isAlreadyOnAccountPage = currentUrl.includes('/compte/') || 
                                       currentUrl.includes('/messages') ||
                                       currentUrl.includes('/mes-annonces');
        
        if (!isAlreadyOnAccountPage) {
          console.log(`🔗 Navigation vers le compte ${accountId}...`);
          
          // Délai avant navigation
          await this.longDelay();
          
          const accountUrl = `https://www.leboncoin.fr/compte/${accountId}`;
          
          try {
            await page.goto(accountUrl, { 
              waitUntil: 'networkidle2',
              timeout: 30000
            });
          } catch (gotoError) {
            if (gotoError.message.includes('timeout')) {
              console.warn('⚠️  Timeout lors de la navigation vers le compte, tentative avec waitUntil: load');
              await page.goto(accountUrl, {
                waitUntil: 'load',
                timeout: 30000
              });
            } else if (gotoError.message.includes('detached Frame')) {
              console.error('❌ La page a été fermée pendant la navigation vers le compte');
              throw new Error('La page a été fermée. Veuillez réessayer.');
            } else {
              throw gotoError;
            }
          }
          
          // Observer le compte
          await this.mediumDelay();
          
          // Vérifier la présence d'un captcha sur la page du compte
          captchaInfo = await this.detectCaptcha(page);
          if (captchaInfo.detected) {
            await this.waitForCaptchaResolution(page);
          }
          
          // Vérifier la popup de cookies sur la page du compte
          console.log('🍪 Vérification de la popup sur la page du compte...');
          await this.randomDelay(2000, 3000);
          
          for (let i = 1; i <= 2; i++) {
            console.log(`🍪 Recherche sur compte (tentative ${i}/2)...`);
            await this.handleCookieConsent(page);
            if (i < 2) {
              await this.randomDelay(1500, 2500);
            }
          }
        } else {
          console.log('ℹ️  Déjà sur une page du compte, pas de navigation nécessaire');
        }
      }

      console.log('✅ Navigation terminée avec succès');
      
      // Vérifier que la page est toujours attachée avant d'obtenir l'URL
      let finalUrl;
      try {
        finalUrl = page.url();
        console.log(`📍 URL finale: ${finalUrl}`);
      } catch (err) {
        console.warn('⚠️  Impossible d\'obtenir l\'URL finale (page peut-être détachée)');
        finalUrl = url; // Utiliser l'URL d'origine
      }
      
      return { success: true, url: finalUrl };
    } catch (error) {
      console.error('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.error('❌ ERREUR LORS DE L\'OUVERTURE DU LIEN');
      console.error(`📧 Email concerné: ${email}`);
      console.error(`❌ Message d'erreur: ${error.message}`);
      console.error('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
      
      // Essayer de fermer la page proprement en cas d'erreur
      try {
        if (page && !page.isClosed()) {
          console.log('🧹 Nettoyage: fermeture de la page...');
          await page.close();
        }
      } catch (closeErr) {
        console.warn('⚠️  Impossible de fermer la page proprement');
      }
      
      // Meilleure gestion des erreurs spécifiques
      if (error.message.includes('detached Frame') || error.message.includes('Execution context was destroyed')) {
        console.error('🔄 La page a été rechargée ou fermée pendant l\'opération');
        console.error('💡 Conseil: Essayez de cliquer à nouveau sur le mail');
        throw new Error('La page a été rechargée pendant l\'opération. Veuillez réessayer.');
      } else if (error.message.includes('fermée')) {
        throw new Error('La page a été fermée. Veuillez réessayer.');
      } else if (error.message.includes('Navigation timeout') || error.message.includes('timeout')) {
        console.error('⏱️  Timeout lors du chargement de la page');
        throw new Error('La page a mis trop de temps à charger. Vérifiez votre connexion internet.');
      } else if (error.message.includes('net::ERR_')) {
        console.error('🌐 Erreur réseau');
        throw new Error('Impossible de se connecter au site. Vérifiez votre connexion internet.');
      } else {
        // Pour toute autre erreur, la relayer telle quelle
        throw error;
      }
    }
  }

  async closeBrowser() {
    if (this.browser) {
      console.log('🔌 Fermeture du navigateur...');
      await this.browser.close();
      this.browser = null;
      console.log('✅ Navigateur fermé');
    }
  }
}

module.exports = new LeboncoinService();
