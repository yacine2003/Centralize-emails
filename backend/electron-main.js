const { app, BrowserWindow } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let mainWindow;
let serverProcess;

// Afficher une page d'erreur
function showErrorPage(message) {
  const errorHTML = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Erreur - LBC Automation</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          display: flex;
          justify-content: center;
          align-items: center;
          height: 100vh;
          margin: 0;
          background: linear-gradient(135deg, #31b376 0%, #28a866 100%);
          color: white;
        }
        .error-container {
          text-align: center;
          padding: 40px;
          background: rgba(255, 255, 255, 0.1);
          border-radius: 15px;
          max-width: 600px;
        }
        h1 { font-size: 2.5rem; margin-bottom: 20px; }
        p { font-size: 1.2rem; line-height: 1.6; }
        .details {
          margin-top: 30px;
          padding: 20px;
          background: rgba(0, 0, 0, 0.2);
          border-radius: 10px;
          font-family: monospace;
          font-size: 0.9rem;
          text-align: left;
        }
      </style>
    </head>
    <body>
      <div class="error-container">
        <h1>⚠️ Erreur</h1>
        <p>${message}</p>
        <div class="details">
          <strong>Détails techniques :</strong><br>
          - Vérifiez la console pour plus d'informations<br>
          - Assurez-vous que le port 3001 n'est pas déjà utilisé<br>
          - Redémarrez l'application
        </div>
      </div>
    </body>
    </html>
  `;
  mainWindow.loadURL(`data:text/html;charset=utf-8,${encodeURIComponent(errorHTML)}`);
}

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

  // Timeout de sécurité (15 secondes max)
  setTimeout(() => {
    clearInterval(checkServer);
    
    // Vérifier une dernière fois si le serveur répond
    const http = require('http');
    const testReq = http.get('http://localhost:3001/api/health', (res) => {
      if (res.statusCode === 200) {
        mainWindow.loadURL('http://localhost:3001');
      } else {
        showErrorPage('Le serveur ne répond pas correctement');
      }
      mainWindow.show();
    });
    
    testReq.on('error', () => {
      showErrorPage('Impossible de se connecter au serveur. Vérifiez la console pour plus de détails.');
      mainWindow.show();
    });
    
    testReq.setTimeout(2000, () => {
      testReq.destroy();
      showErrorPage('Timeout lors de la connexion au serveur.');
      mainWindow.show();
    });
  }, 15000);

  // Ouvrir les DevTools pour voir les erreurs (toujours en production aussi pour debug)
  mainWindow.webContents.openDevTools();
  
  // Logger les erreurs de chargement
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('❌ Erreur de chargement:', errorCode, errorDescription);
  });
  
  mainWindow.webContents.on('console-message', (event, level, message) => {
    console.log(`[Console ${level}]:`, message);
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// Démarrer le serveur Express en arrière-plan
function startServer() {
  // Dans Electron packagé, __dirname pointe vers resources/app.asar ou resources/app
  // Il faut utiliser app.getAppPath() pour obtenir le bon chemin
  const appPath = app.getAppPath();
  const serverPath = path.join(appPath, 'src', 'server.js');
  
  console.log('📁 Chemin de l\'application:', appPath);
  console.log('📁 Chemin du serveur:', serverPath);
  console.log('📁 __dirname:', __dirname);
  
  // Vérifier que le fichier existe
  const fs = require('fs');
  if (!fs.existsSync(serverPath)) {
    console.error('❌ Fichier serveur non trouvé:', serverPath);
    // Essayer avec __dirname
    const altPath = path.join(__dirname, 'src', 'server.js');
    console.log('🔄 Tentative avec chemin alternatif:', altPath);
    if (fs.existsSync(altPath)) {
      console.log('✅ Fichier trouvé avec chemin alternatif');
    } else {
      console.error('❌ Fichier non trouvé non plus avec chemin alternatif');
    }
  }
  
  // Utiliser Node.js embarqué d'Electron
  serverProcess = spawn(process.execPath, [serverPath], {
    cwd: appPath,
    env: {
      ...process.env,
      PORT: '3001',
      NODE_ENV: 'production',
      ELECTRON_RUN_AS_NODE: '1'
    },
    stdio: ['ignore', 'pipe', 'pipe'] // Capturer stdout et stderr
  });

  // Logger la sortie du serveur
  serverProcess.stdout.on('data', (data) => {
    console.log(`[Serveur] ${data.toString()}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`[Serveur Error] ${data.toString()}`);
  });

  serverProcess.on('error', (err) => {
    console.error('❌ Erreur lors du démarrage du serveur:', err);
  });

  serverProcess.on('exit', (code, signal) => {
    console.log(`Serveur arrêté avec le code ${code}, signal ${signal}`);
    if (code !== 0 && code !== null) {
      console.error('❌ Le serveur s\'est arrêté avec une erreur !');
    }
  });
}

// Quand Electron est prêt
app.whenReady().then(() => {
  console.log('🚀 Démarrage de LBC Automation...');
  console.log('📦 Mode:', app.isPackaged ? 'Production (packagé)' : 'Développement');
  console.log('📁 App Path:', app.getAppPath());
  
  // Démarrer le serveur Express
  startServer();
  
  // Attendre un peu que le serveur démarre (plus de temps en production)
  const delay = app.isPackaged ? 5000 : 2000;
  console.log(`⏳ Attente de ${delay}ms avant de créer la fenêtre...`);
  
  setTimeout(() => {
    createWindow();
  }, delay);

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
