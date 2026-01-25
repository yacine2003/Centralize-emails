require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const emailRoutes = require('./routes/emails');

const app = express();
const PORT = process.env.PORT || 3001;

// Variable globale pour le chemin public
let publicPath;

// Middleware
app.use(cors());
app.use(express.json());

// Servir les fichiers statiques du frontend (dossier public)
// Gérer les chemins dans l'environnement Electron packagé
if (process.env.ELECTRON_RUN_AS_NODE || process.resourcesPath) {
  // Environnement Electron packagé
  const fs = require('fs');
  // Essayer plusieurs chemins possibles
  const possiblePaths = [
    path.join(__dirname, '../public'),
    path.join(process.resourcesPath, 'app', 'public'),
    path.join(process.resourcesPath, 'app.asar.unpacked', 'public'),
    path.join(__dirname, '..', '..', 'public')
  ];
  
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      publicPath = testPath;
      console.log(`✅ Dossier public trouvé: ${publicPath}`);
      break;
    }
  }
  
  if (!publicPath) {
    console.error('❌ Dossier public non trouvé. Chemins testés:', possiblePaths);
    publicPath = path.join(__dirname, '../public'); // Fallback
  }
} else {
  // Environnement normal (dev ou Node.js standard)
  publicPath = path.join(__dirname, '../public');
}

console.log(`📁 Chemin public utilisé: ${publicPath}`);
app.use(express.static(publicPath));

// Logger middleware
app.use((req, res, next) => {
  console.log(`${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api', emailRoutes);

// Pour toute autre route, servir l'index.html du frontend (SPA support)
app.get('*', (req, res) => {
  // Si la requête commence par /api, on renvoie un 404 JSON
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ 
      error: 'Endpoint API non trouvé',
      path: req.path
    });
  }
  
  // Sinon on sert le frontend
  const indexPath = path.join(publicPath || path.join(__dirname, '../public'), 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) {
      // Si le frontend n'est pas encore buildé, on affiche un message d'aide
      res.status(200).json({ 
        message: 'API Centralize-Emails opérationnelle',
        status: 'Frontend non détecté (Dossier backend/public manquant)',
        help: 'Pour livrer le projet : 1. npm run build dans frontend, 2. copiez le contenu de frontend/build dans backend/public'
      });
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
