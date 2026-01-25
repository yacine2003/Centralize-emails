# 🚀 Démarrage Rapide - Version Electron (.exe)

Guide ultra-rapide pour créer un `.exe` Windows avec Electron.

---

## 📋 Sur Windows (Vous - Développeur)

### 1. Préparer le Frontend

```cmd
cd frontend
npm install
npm run build
cd ..
```

### 2. Copier le Frontend

```cmd
mkdir backend\public
xcopy /E /Y frontend\build\* backend\public\
```

### 3. Installer Electron

```cmd
cd backend
npm install
```

**Durée :** 5-10 minutes (téléchargement d'Electron)

### 4. Tester en Mode Dev

```cmd
npm run electron-dev
```

Une fenêtre Electron s'ouvre avec votre application !

### 5. Créer le .exe

```cmd
npm run build-win
```

**Durée :** 10-15 minutes (première fois)

### 6. Trouver le .exe

Le fichier est dans :
```
backend\dist-electron\LBC Automation Setup 1.0.0.exe
```

---

## 👤 Pour le Client Final

### Avec Installeur (Recommandé)

1. Double-cliquez sur `LBC Automation Setup 1.0.0.exe`
2. Suivez l'assistant d'installation
3. Lancez depuis le menu Démarrer

### Version Portable

1. Allez dans `dist-electron\win-unpacked\`
2. Double-cliquez sur `LBC Automation.exe`
3. L'application démarre directement

---

## 📁 Structure Après Build

```
backend/
└── dist-electron/
    ├── LBC Automation Setup 1.0.0.exe    ← Installeur (à livrer)
    └── win-unpacked/                      ← Version portable
        └── LBC Automation.exe
```

---

## ✅ Avantages Electron

- 🚀 **Vrai .exe** - Fichier Windows natif
- 💯 **Fiabilité 100%** - Fonctionne avec toutes les libs
- 📦 **Installeur** - Installation professionnelle
- 🎨 **Icône** - Possibilité d'ajouter une icône
- 🔗 **Raccourcis** - Bureau et menu Démarrer automatiques

---

## 🆘 Problèmes ?

Consultez le guide complet : **[BUILD_ELECTRON.md](./BUILD_ELECTRON.md)**

---

**C'est tout ! Simple, rapide, efficace.** 🎉
