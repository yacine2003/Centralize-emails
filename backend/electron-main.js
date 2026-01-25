const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let mainWindow;
let serverProcess;
let serverErrors = [];
let serverReady = false;

// Afficher une page d'erreur
function showErrorPage(message, errors = []) {
  const errorsHTML = errors.length > 0 
    ? `<div style="margin-top: 20px; padding: 15px; background: rgba(255, 0, 0, 0.2); border-radius: 8px; text-align: left;">
         <strong>Erreurs du serveur :</strong><br>
         <pre style="white-space: pre-wrap; font-size: 0.85rem;">${errors.join('\n')}</pre>
       </div>`
    : '';
    
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
          max-width: 800px;
          max-height: 90vh;
          overflow-y: auto;
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
        pre {
          margin: 10px 0;
          padding: 10px;
          background: rgba(0, 0, 0, 0.3);
          border-radius: 5px;
          overflow-x: auto;
        }
      </style>
    </head>
    <body>
      <div class="error-container">
        <h1>⚠️ Erreur</h1>
        <p>${message}</p>
        ${errorsHTML}
        <div class="details">
          <strong>Détails techniques :</strong><br>
          - Vérifiez la console Electron pour plus d'informations<br>
          - Assurez-vous que le port 3001 n'est pas déjà utilisé<br>
          - Vérifiez que le dossier public existe dans le package<br>
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
      const errorMessage = serverErrors.length > 0
        ? `Impossible de se connecter au serveur.\n\nErreurs détectées:\n${serverErrors.slice(-5).join('\n')}`
        : 'Impossible de se connecter au serveur. Le serveur ne semble pas avoir démarré.';
      showErrorPage(errorMessage, serverErrors);
      mainWindow.show();
    });
    
    testReq.setTimeout(2000, () => {
      testReq.destroy();
      const errorMessage = serverErrors.length > 0
        ? `Timeout lors de la connexion au serveur.\n\nErreurs détectées:\n${serverErrors.slice(-5).join('\n')}`
        : 'Timeout lors de la connexion au serveur. Le serveur n\'a pas répondu à temps.';
      showErrorPage(errorMessage, serverErrors);
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

// Démarrer le serveur Express directement dans le processus Electron
function startServer() {
  const appPath = app.getAppPath();
  const fs = require('fs');
  
  console.log('📁 Chemin de l\'application:', appPath);
  console.log('📁 __dirname:', __dirname);
  
  // Définir les variables d'environnement
  process.env.PORT = '3001';
  process.env.NODE_ENV = 'production';
  
  // Trouver le chemin du serveur
  let serverModulePath;
  const possiblePaths = [
    path.join(appPath, 'src', 'server.js'),
    path.join(__dirname, 'src', 'server.js'),
    path.join(appPath, '..', 'src', 'server.js')
  ];
  
  for (const testPath of possiblePaths) {
    if (fs.existsSync(testPath)) {
      serverModulePath = testPath;
      console.log('✅ Fichier serveur trouvé:', serverModulePath);
      break;
    }
  }
  
  if (!serverModulePath) {
    const errorMsg = 'Fichier serveur (src/server.js) non trouvé. Chemins testés: ' + possiblePaths.join(', ');
    console.error('❌', errorMsg);
    serverErrors.push(errorMsg);
    return;
  }
  
  // Lancer le serveur directement dans le processus Electron
  // Utiliser setImmediate pour ne pas bloquer le démarrage d'Electron
  console.log('🚀 Lancement du serveur Express dans le processus Electron...');
  
  try {
    // Changer le répertoire de travail si nécessaire
    const originalCwd = process.cwd();
    const serverDir = path.dirname(serverModulePath);
    
    // Require le serveur directement
    // Le serveur va démarrer automatiquement car il a app.listen() à la fin
    require(serverModulePath);
    
    serverReady = true;
    console.log('✅ Serveur Express démarré avec succès dans le processus Electron');
    
    // Marquer qu'on a un "processus serveur" (même si c'est dans le même processus)
    serverProcess = { pid: process.pid, kill: () => {} };
    
  } catch (error) {
    const errorMsg = `Erreur lors du démarrage du serveur: ${error.message}\n${error.stack}`;
    console.error('❌', errorMsg);
    serverErrors.push(errorMsg);
    serverReady = false;
  }

  // Logger la sortie du serveur
  serverProcess.stdout.on('data', (data) => {
    const output = data.toString();
    console.log(`[Serveur] ${output}`);
    
    // Détecter si le serveur démarre correctement
    if (output.includes('Serveur Centralize-Emails démarré') || output.includes('localhost:3001')) {
      serverReady = true;
      console.log('✅ Serveur démarré avec succès !');
    }
  });

  serverProcess.stderr.on('data', (data) => {
    const error = data.toString();
    console.error(`[Serveur Error] ${error}`);
    serverErrors.push(error);
    
    // Limiter à 10 erreurs pour éviter de surcharger
    if (serverErrors.length > 10) {
      serverErrors.shift();
    }
  });

  serverProcess.on('error', (err) => {
    const errorMsg = `Erreur lors du démarrage du serveur: ${err.message}`;
    console.error('❌', errorMsg);
    serverErrors.push(errorMsg);
  });

  serverProcess.on('exit', (code, signal) => {
    console.log(`Serveur arrêté avec le code ${code}, signal ${signal}`);
    if (code !== 0 && code !== null) {
      const errorMsg = `Le serveur s'est arrêté avec une erreur (code: ${code})`;
      console.error('❌', errorMsg);
      serverErrors.push(errorMsg);
      serverReady = false;
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
  // Le serveur tourne dans le même processus, il s'arrêtera avec l'app
  // Sur macOS, garder l'app active même si toutes les fenêtres sont fermées
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Arrêt propre
app.on('before-quit', () => {
  // Le serveur s'arrêtera automatiquement quand le processus se termine
  console.log('🛑 Arrêt de l\'application...');
});

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
  console.error('❌ Erreur non capturée:', error);
});
