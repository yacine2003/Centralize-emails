const express = require('express');
const router = express.Router();
const googleSheetsService = require('../services/googleSheetsService');
const imapService = require('../services/imapService');
const leboncoinService = require('../services/leboncoinService');

// Route pour récupérer les emails Leboncoin depuis tous les comptes
router.get('/emails/leboncoin', async (req, res) => {
  try {
    const { spreadsheetId } = req.query;
    
    if (!spreadsheetId) {
      return res.status(400).json({ 
        error: 'spreadsheetId requis en paramètre de requête' 
      });
    }

    console.log(`\n📊 Récupération des emails pour le Sheet: ${spreadsheetId}`);

    // Initialiser la connexion au Google Sheet
    await googleSheetsService.init(spreadsheetId);
    
    // Récupérer tous les comptes depuis le sheet
    const accounts = await googleSheetsService.getEmailAccounts();
    
    if (accounts.length === 0) {
      return res.json({ 
        emails: [], 
        message: 'Aucun compte trouvé dans le Google Sheet' 
      });
    }

    // Récupérer les emails depuis tous les comptes
    const emails = await imapService.getAllLeboncoinEmails(accounts);
    
    console.log(`✅ ${emails.length} emails récupérés au total\n`);
    
    res.json({ 
      emails,
      count: emails.length,
      accountsProcessed: accounts.length
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.stack 
    });
  }
});

// Route pour ouvrir un email Leboncoin avec connexion automatisée
router.post('/emails/open', async (req, res) => {
  try {
    const { url, email, password, accountId, category } = req.body;
    
    if (!url || !email || !password) {
      return res.status(400).json({ 
        error: 'url, email et password requis' 
      });
    }

    console.log(`\n🔗 Ouverture du lien Leboncoin pour ${email}`);
    if (category) {
      console.log(`📂 Catégorie: ${category}`);
    }

    const result = await leboncoinService.openEmailLink(
      url, 
      email, 
      password, 
      accountId,
      category
    );
    
    res.json({ 
      success: true, 
      url: result.url,
      message: 'Lien ouvert avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    
    // Fournir des messages d'erreur plus clairs selon le type d'erreur
    let userMessage = error.message;
    let statusCode = 500;
    
    if (error.message.includes('detached Frame') || error.message.includes('fermée')) {
      userMessage = 'La page a été fermée pendant l\'opération. Veuillez réessayer.';
      statusCode = 409; // Conflict
    } else if (error.message.includes('timeout') || error.message.includes('trop de temps')) {
      userMessage = 'La page a mis trop de temps à charger. Vérifiez votre connexion internet et réessayez.';
      statusCode = 408; // Request Timeout
    } else if (error.message.includes('connexion') || error.message.includes('network') || error.message.includes('net::ERR_')) {
      userMessage = 'Impossible de se connecter au site. Vérifiez votre connexion internet.';
      statusCode = 503; // Service Unavailable
    } else if (error.message.includes('IMAP') || error.message.includes('authentication')) {
      userMessage = 'Erreur d\'authentification. Vérifiez vos identifiants dans le Google Sheet.';
      statusCode = 401; // Unauthorized
    }
    
    res.status(statusCode).json({ 
      error: userMessage,
      technicalDetails: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Route pour fermer le navigateur Puppeteer
router.post('/browser/close', async (req, res) => {
  try {
    await leboncoinService.closeBrowser();
    res.json({ 
      success: true, 
      message: 'Navigateur fermé avec succès' 
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({ error: error.message });
  }
});

// Route de santé pour vérifier que l'API fonctionne
router.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    message: 'API Centralize-Emails opérationnelle',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
