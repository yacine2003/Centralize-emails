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
    const { url, email, password, accountId } = req.body;
    
    if (!url || !email || !password) {
      return res.status(400).json({ 
        error: 'url, email et password requis' 
      });
    }

    console.log(`\n🔗 Ouverture du lien Leboncoin pour ${email}`);

    const result = await leboncoinService.openEmailLink(
      url, 
      email, 
      password, 
      accountId
    );
    
    res.json({ 
      success: true, 
      url: result.url,
      message: 'Lien ouvert avec succès'
    });
  } catch (error) {
    console.error('❌ Erreur:', error);
    res.status(500).json({ 
      error: error.message,
      details: error.stack
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
