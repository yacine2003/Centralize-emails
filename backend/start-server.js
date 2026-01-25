// Script wrapper pour lancer le serveur Express dans Electron
// Ce fichier sera extrait de app.asar et pourra être exécuté directement

// Définir les variables d'environnement
process.env.PORT = process.env.PORT || '3001';
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

// Lancer le serveur
try {
  require('./src/server.js');
  console.log('✅ Serveur Express démarré avec succès');
} catch (error) {
  console.error('❌ Erreur lors du démarrage du serveur:', error);
  process.exit(1);
}
