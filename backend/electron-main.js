const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

// Fonction pour créer la fenêtre principale
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
    icon: path.join(__dirname, 'assets', 'icon.png'), // Optionnel : icône
    show: false, // Ne pas afficher avant que la page soit chargée
    title: 'LBC Automation - Centralisation des emails Leboncoin'
  });

  // Attendre que le serveur soit prêt avant d'afficher
  const checkServer = setInterval(() => {
    const http = require('http');
    const req = http.get('http://localhost:3001/api/health', (res) => {
      if (res.statusCode === 200) {
        clearInterval(checkServer);
        mainWindow.loadURL('http://localhost:3001');
        mainWindow.show();
        mainWindow.focus();
      }
    });
    req.on('error', () => {
      // Serveur pas encore prêt, continuer à attendre
    });
  }, 500);

  // Timeout de sécurité (10 secondes max)
  setTimeout(() => {
    clearInterval(checkServer);
    mainWindow.loadURL('http://localhost:3001');
    mainWindow.show();
  }, 10000);

  // Ouvrir les DevTools en développement (optionnel)
  if (process.env.NODE_ENV === 'development') {
    mainWindow.webContents.openDevTools();
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Démarrer le serveur Express en arrière-plan
function startServer() {
  const serverPath = path.join(__dirname, 'src', 'server.js');
  
  // Utiliser Node.js embarqué d'Electron
  serverProcess = spawn(process.execPath, [serverPath], {
    cwd: __dirname,
    env: {
      ...process.env,
      PORT: '3001',
      NODE_ENV: 'production'
    },
    stdio: 'inherit'
  });

  serverProcess.on('error', (err) => {
    console.error('❌ Erreur lors du démarrage du serveur:', err);
  });

  serverProcess.on('exit', (code) => {
    console.log(`Serveur arrêté avec le code ${code}`);
  });
}

// Quand Electron est prêt
app.whenReady().then(() => {
  console.log('🚀 Démarrage de LBC Automation...');
  
  // Démarrer le serveur Express
  startServer();
  
  // Attendre un peu que le serveur démarre
  setTimeout(() => {
    createWindow();
  }, 2000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Fermer toutes les fenêtres quand l'app se ferme
app.on('window-all-closed', () => {
  // Arrêter le serveur
  if (serverProcess) {
    serverProcess.kill();
  }
  
  // Sur macOS, garder l'app active même si toutes les fenêtres sont fermées
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Arrêt propre
app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('❌ Erreur non capturée:', error);
});
