require('dotenv').config();
const express = require('express');
const cors = require('cors');
const emailRoutes = require('./routes/emails');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', emailRoutes);

// Route racine
app.get('/', (req, res) => {
  res.json({ 
    message: 'API Centralize-Emails',
    version: '1.0.0',
    endpoints: {
      health: 'GET /api/health',
      emails: 'GET /api/emails/leboncoin?spreadsheetId=<ID>',
      open: 'POST /api/emails/open',
      closeBrowser: 'POST /api/browser/close'
    }
  });
});

// Gestionnaire d'erreurs global
app.use((err, req, res, next) => {
  console.error('❌ Erreur globale:', err);
  res.status(500).json({ 
    error: 'Erreur serveur interne',
    message: err.message 
  });
});

// Démarrer le serveur
app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🚀 Serveur Centralize-Emails démarré           ║
║                                                   ║
║   📍 URL: http://localhost:${PORT}                   ║
║   🌍 Environnement: ${process.env.NODE_ENV || 'development'}               ║
║                                                   ║
║   📚 Documentation: http://localhost:${PORT}/         ║
║   ❤️  Health check: http://localhost:${PORT}/api/health ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
  `);
});

// Gestion de l'arrêt gracieux
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  process.exit(0);
});
