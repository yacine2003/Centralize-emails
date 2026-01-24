# 📦 Guide de Build et Livraison

Ce document explique comment préparer et livrer le projet **Centralize-Emails** en tant qu'application exécutable Windows (`.exe`).

---

## 🎯 Objectif Final

Créer un dossier compressé contenant :
- ✅ `LBC-Automation.exe` - L'application complète (backend + frontend)
- ✅ `service_account.json` - Les credentials Google Sheets
- ✅ `chrome-win/` - Le navigateur Chromium portable (pour Puppeteer)

---

## 📋 Prérequis

### Sur votre Mac (préparation)
- Node.js installé
- Tous les `node_modules` installés dans `frontend` et `backend`

### Sur Windows (build final - RECOMMANDÉ)
- Node.js installé
- `pkg` installé globalement : `npm install -g pkg`

---

## 🚀 Étapes de Préparation (Sur Mac)

### Étape 1 : Builder le Frontend

```bash
cd frontend
npm run build
```

✅ Cela crée un dossier `frontend/build` avec votre application React optimisée.

### Étape 2 : Copier le Build vers le Backend

```bash
# Créer le dossier public dans backend
mkdir -p backend/public

# Copier le contenu du build
cp -r frontend/build/* backend/public/
```

✅ Le dossier `backend/public` contient maintenant tout le frontend.

### Étape 3 : Tester l'Application Unifiée

```bash
cd backend
npm start
```

Ouvrez votre navigateur sur `http://localhost:3001`. Vous devriez voir l'application complète (frontend + backend sur le même port).

---

## 🔨 Étapes de Build (Sur Windows - RECOMMANDÉ)

### Étape 4 : Transférer le Projet sur Windows

1. Compressez le dossier `backend` entier (avec le dossier `public` dedans)
2. Transférez-le sur votre machine Windows
3. Décompressez-le

### Étape 5 : Installer les Dépendances

```bash
cd backend
npm install
```

### Étape 6 : Créer le .exe

```bash
npm run build
```

OU manuellement :

```bash
pkg . --targets node18-win-x64 --output dist/LBC-Automation.exe
```

✅ Le fichier `LBC-Automation.exe` est créé dans le dossier `dist/`.

---

## 🌐 Gérer Chromium pour Puppeteer

Le `.exe` généré **n'inclut pas** le navigateur Chrome nécessaire pour Puppeteer. Vous avez deux options :

### Option 1 : Chromium Portable (RECOMMANDÉ)

1. Téléchargez Chromium portable pour Windows depuis : https://chromium.woolyss.com/
2. Décompressez-le dans un dossier nommé `chrome-win`
3. Placez ce dossier à côté de votre `.exe`

Structure finale :
```
LBC-Automation/
├── LBC-Automation.exe
├── service_account.json
├── chrome-win/
│   └── chrome.exe
└── README.txt (instructions pour le client)
```

### Option 2 : Chrome Local

Le client doit avoir Google Chrome installé sur son PC. Le code cherchera automatiquement l'exécutable Chrome standard de Windows.

---

## 📦 Livraison au Client

### Étape 7 : Préparer le Dossier Final

Créez un dossier `LBC-Automation-v1.0` contenant :

```
LBC-Automation-v1.0/
├── LBC-Automation.exe          # L'application
├── service_account.json         # Credentials Google Sheets
├── chrome-win/                  # Chromium portable (si utilisé)
│   └── chrome.exe
└── INSTRUCTIONS.txt             # Guide pour le client
```

### Étape 8 : Compresser et Envoyer

1. Compressez le dossier en `.zip`
2. Envoyez-le au client

---

## 📝 Instructions pour le Client (INSTRUCTIONS.txt)

Créez un fichier texte simple pour votre client :

```
=== LBC AUTOMATION - GUIDE D'UTILISATION ===

1. DÉCOMPRESSION
   - Décompressez ce dossier sur votre ordinateur
   - Ne déplacez aucun fichier, gardez la structure intacte

2. PRÉREQUIS
   - Connexion Internet active
   - Le Google Sheet "LBC-Automation" doit être accessible

3. LANCEMENT
   - Double-cliquez sur "LBC-Automation.exe"
   - Patientez quelques secondes pendant le démarrage
   - Votre navigateur s'ouvrira automatiquement sur http://localhost:3001

4. UTILISATION
   - Cliquez sur "Rafraîchir les emails" pour récupérer les emails
   - Utilisez les filtres pour trier par catégorie ou par compte
   - Cliquez sur un email pour ouvrir le lien Leboncoin associé

5. ARRÊT
   - Fermez simplement la fenêtre du navigateur
   - Le serveur s'arrêtera automatiquement après quelques secondes

6. DÉPANNAGE
   - Si rien ne s'affiche : Vérifiez votre pare-feu
   - Si les emails ne se chargent pas : Vérifiez le Google Sheet
   - En cas de problème : Contactez le support

==============================================
```

---

## ⚠️ Points Importants

### À NE PAS Livrer
- ❌ Le dossier `node_modules` (déjà inclus dans le `.exe`)
- ❌ Les dossiers `.git` ou `.gitignore`
- ❌ Les fichiers de développement (`.env` de dev, logs, etc.)

### À Vérifier Avant Livraison
- ✅ Le fichier `service_account.json` est bien présent
- ✅ L'ID du Google Sheet est codé en dur dans le frontend
- ✅ Le `.exe` se lance bien sur Windows (testez-le !)
- ✅ Le navigateur s'ouvre automatiquement

---

## 🐛 Dépannage

### Erreur "pkg not found"
```bash
npm install -g pkg
```

### Erreur "bin property missing"
Vérifiez que le `package.json` contient bien :
```json
"bin": "src/server.js"
```

### Le .exe ne se lance pas
- Vérifiez l'antivirus Windows (peut bloquer les .exe générés par pkg)
- Lancez en tant qu'administrateur si nécessaire

### Puppeteer ne trouve pas Chrome
- Assurez-vous que le dossier `chrome-win` est bien à côté du `.exe`
- Vérifiez que le chemin est correct dans le code

---

## 🎉 C'est Terminé !

Votre application est prête à être livrée et utilisée sur n'importe quel PC Windows sans installation de Node.js ou de dépendances supplémentaires.
