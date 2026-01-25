# 📦 Guide de Build - Version Electron (.exe)

Ce guide explique comment créer un fichier `.exe` Windows avec Electron et electron-builder.

---

## 🎯 Avantages d'Electron

✅ **Fiabilité 100%** - Fonctionne avec toutes les bibliothèques modernes  
✅ **Vrai .exe** - Fichier exécutable Windows natif  
✅ **Installeur** - Crée un installeur NSIS professionnel  
✅ **Icône personnalisée** - Possibilité d'ajouter une icône  
✅ **Raccourcis** - Crée automatiquement des raccourcis bureau/menu  

---

## 📋 Prérequis

- Node.js 18+ installé
- Windows (pour créer le .exe Windows)
- Connexion Internet (pour télécharger Electron)

---

## 🚀 Étapes de Build

### Étape 1 : Préparer le Frontend

```cmd
cd frontend
npm install
npm run build
cd ..
```

### Étape 2 : Copier le Frontend vers Backend

```cmd
mkdir backend\public
xcopy /E /Y frontend\build\* backend\public\
```

### Étape 3 : Installer les Dépendances Electron

```cmd
cd backend
npm install
```

Cela va installer :
- `electron` - Le framework Electron
- `electron-builder` - L'outil de build
- `cross-env` - Pour les variables d'environnement

**Durée :** 5-10 minutes (téléchargement d'Electron ~150 MB)

### Étape 4 : Tester Electron en Mode Dev

```cmd
npm run electron-dev
```

Une fenêtre Electron devrait s'ouvrir avec votre application !

### Étape 5 : Créer le .exe

```cmd
npm run build-win
```

**Durée :** 10-15 minutes (première fois, car télécharge les outils de build)

Le fichier `.exe` sera créé dans `backend/dist-electron/`

---

## 📁 Structure Après Build

```
backend/
└── dist-electron/
    ├── LBC Automation Setup 1.0.0.exe    ← Installeur
    └── win-unpacked/                      ← Version portable (sans installer)
        └── LBC Automation.exe
```

---

## 🎨 Personnalisation (Optionnel)

### Ajouter une Icône

1. Créez un fichier `backend/assets/icon.ico` (format .ico pour Windows)
2. Le build l'utilisera automatiquement

### Modifier le Nom de l'Application

Dans `package.json`, modifiez :
```json
"productName": "Votre Nom d'App"
```

---

## 🧪 Tester le .exe

### Option 1 : Utiliser l'Installeur

1. Double-cliquez sur `LBC Automation Setup 1.0.0.exe`
2. Suivez l'assistant d'installation
3. Lancez depuis le menu Démarrer ou le raccourci bureau

### Option 2 : Version Portable

1. Allez dans `dist-electron/win-unpacked/`
2. Double-cliquez sur `LBC Automation.exe`
3. L'application démarre directement (sans installation)

---

## 📤 Livraison au Client

### Avec Installeur (Recommandé)

Envoyez uniquement :
- ✅ `LBC Automation Setup 1.0.0.exe`

Le client installe normalement comme n'importe quelle application Windows.

### Version Portable

Envoyez le dossier `win-unpacked/` compressé en .zip.

---

## ⚙️ Configuration Avancée

### Modifier la Configuration de Build

Dans `package.json`, section `"build"` :

```json
{
  "build": {
    "appId": "com.lbc.automation",
    "productName": "LBC Automation",
    "win": {
      "target": "nsis",  // ou "portable" pour pas d'installeur
      ...
    }
  }
}
```

### Options de Target

- `"nsis"` - Installeur Windows (recommandé)
- `"portable"` - Version portable (pas d'installation)
- `"zip"` - Archive compressée

---

## 🆘 Dépannage

### Erreur "electron not found"

```cmd
npm install electron --save-dev
```

### Erreur lors du build

Vérifiez que :
- ✅ Le frontend est buildé et dans `backend/public/`
- ✅ Toutes les dépendances sont installées (`npm install`)
- ✅ Vous êtes dans le dossier `backend/`

### Le .exe est trop gros

C'est normal ! Electron inclut Chromium (~150 MB).  
Pour réduire, utilisez `electron-builder` avec l'option `compression: "maximum"`.

---

## ✅ Checklist Avant Livraison

- [ ] Frontend buildé et copié dans `backend/public/`
- [ ] `npm install` exécuté dans `backend/`
- [ ] `npm run electron-dev` fonctionne (test en dev)
- [ ] `npm run build-win` créé le .exe sans erreur
- [ ] Le .exe se lance et affiche l'interface
- [ ] Les emails se chargent depuis Google Sheets
- [ ] Un clic sur un email fonctionne

---

## 🎉 C'est Terminé !

Votre application est maintenant un vrai `.exe` Windows professionnel !

**Avantages par rapport à pkg :**
- ✅ Fonctionne avec toutes les bibliothèques modernes
- ✅ Pas de problème avec gaxios/google-auth-library
- ✅ Installeur professionnel
- ✅ Raccourcis automatiques
- ✅ Plus facile à maintenir

---

**Bon build ! 🚀**
