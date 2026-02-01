const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const googleSheetsService = require('../services/googleSheetsService');

// Fichier de configuration
const CONFIG_FILE = path.join(__dirname, '../config.json');

// Fonction pour lire la configuration
async function readConfig() {
  try {
    const data = await fs.readFile(CONFIG_FILE, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    // Si le fichier n'existe pas, retourner une config vide
    if (error.code === 'ENOENT') {
      return {};
    }
    throw error;
  }
}

// Fonction pour écrire la configuration
async function writeConfig(config) {
  await fs.writeFile(CONFIG_FILE, JSON.stringify(config, null, 2), 'utf8');
}

// GET : Récupérer la configuration actuelle
router.get('/', async (req, res) => {
  try {
    const config = await readConfig();
    res.json(config);
  } catch (error) {
    console.error('❌ Erreur lecture config:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST : Sauvegarder une nouvelle configuration
router.post('/', async (req, res) => {
  try {
    const { spreadsheetId } = req.body;
    
    if (!spreadsheetId) {
      return res.status(400).json({ 
        error: 'spreadsheetId requis' 
      });
    }

    // Vérifier que le spreadsheetId est valide avant de sauvegarder
    try {
      await googleSheetsService.init(spreadsheetId);
      await googleSheetsService.getEmailAccounts();
    } catch (error) {
      return res.status(400).json({ 
        error: 'Impossible d\'accéder au Google Sheet. Vérifiez l\'ID et les permissions.',
        details: error.message
      });
    }

    const config = {
      spreadsheetId,
      updatedAt: new Date().toISOString()
    };

    await writeConfig(config);
    
    console.log(`✅ Configuration sauvegardée: ${spreadsheetId}`);
    
    res.json({ 
      success: true, 
      message: 'Configuration sauvegardée',
      config 
    });
  } catch (error) {
    console.error('❌ Erreur sauvegarde config:', error);
    res.status(500).json({ error: error.message });
  }
});

// GET : Vérifier qu'un Google Sheet est accessible
router.get('/verify', async (req, res) => {
  try {
    const { spreadsheetId } = req.query;
    
    if (!spreadsheetId) {
      return res.status(400).json({ 
        error: 'spreadsheetId requis en paramètre' 
      });
    }

    console.log(`🔍 Vérification du Google Sheet: ${spreadsheetId}`);

    // Initialiser et récupérer les infos du sheet
    await googleSheetsService.init(spreadsheetId);
    const accounts = await googleSheetsService.getEmailAccounts();
    
    // Récupérer le titre du sheet
    const doc = googleSheetsService.doc;
    await doc.loadInfo();
    
    res.json({
      success: true,
      title: doc.title,
      accountsCount: accounts.length,
      accounts: accounts.map(acc => ({
        imapEmail: acc.imapEmail,
        lbcPassword: acc.lbcPassword ? '***' : null
      }))
    });
  } catch (error) {
    console.error('❌ Erreur vérification:', error);
    
    let userMessage = error.message;
    
    if (error.message.includes('No values in the header row')) {
      userMessage = 'Le Google Sheet ne contient pas de données valides. Vérifiez la structure du sheet.';
    } else if (error.message.includes('Could not parse response') || error.message.includes('404')) {
      userMessage = 'Google Sheet introuvable. Vérifiez l\'ID ou les permissions de partage.';
    } else if (error.message.includes('permission') || error.message.includes('credentials')) {
      userMessage = 'Permissions insuffisantes. Assurez-vous que le compte de service a accès au Google Sheet.';
    }
    
    res.status(400).json({ 
      error: userMessage,
      details: error.message
    });
  }
});

module.exports = router;
