# 📦 Guide de Build - Version Portable Node.js

Ce guide explique comment créer la version portable de LBC Automation avec Node.js embarqué.

---

## 🎯 Avantages de la Version Portable

✅ **Fiabilité à 100%** - Aucun problème de compatibilité  
✅ **Simple pour l'utilisateur** - Double-clic sur un .bat  
✅ **Aucune installation** - Node.js inclus dans le package  
✅ **Facile à mettre à jour** - Remplacer juste le dossier app/  
✅ **Pas de problème d'antivirus** - Fichiers sources visibles  

---

## 🚀 Préparation (Sur Windows)

### Prérequis

- Git installé
- PowerShell (inclus dans Windows)
- Connexion Internet (pour télécharger Node.js)

---

## 📋 Étapes de Build

### Étape 1 : Cloner le Projet

```cmd
git clone https://github.com/yacine2003/Centralize-emails.git
cd Centralize-emails
git checkout dev
```

### Étape 2 : Builder le Frontend

```cmd
cd frontend
npm install
npm run build
cd ..
```

### Étape 3 : Copier le Frontend vers le Backend

```cmd
mkdir backend\public
xcopy /E /Y frontend\build\* backend\public\
```

### Étape 4 : Lancer le Script de Préparation Portable

```powershell
# Ouvrir PowerShell dans le dossier du projet
# Autoriser l'exécution de scripts (une seule fois)
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

# Lancer le script
.\setup-portable.ps1
```

**Ce script va automatiquement :**
1. ✅ Télécharger Node.js portable (v18.19.0)
2. ✅ Extraire Node.js dans `node-portable/`
3. ✅ Copier votre code dans `app/`
4. ✅ Installer les dépendances (`npm install --production`)
5. ✅ Copier `service_account.json`

**Durée estimée :** 5-10 minutes

---

## 🧪 Tester Avant de Livrer

### Test 1 : Lancement

```cmd
# Double-cliquer sur LBC-Automation.bat
# OU en ligne de commande :
LBC-Automation.bat
```

**Ce qui doit se passer :**
1. ✅ Une fenêtre console s'ouvre
2. ✅ Le message "Démarrage du serveur..." apparaît
3. ✅ Le navigateur s'ouvre sur `http://localhost:3001`
4. ✅ L'interface React s'affiche

### Test 2 : Fonctionnalités

1. ✅ Cliquez sur "Rafraîchir les emails"
2. ✅ Les emails se chargent depuis Google Sheets
3. ✅ Les filtres fonctionnent
4. ✅ Cliquez sur un email → Le navigateur s'ouvre

---

## 📤 Préparer la Livraison

### Structure du Dossier Final

```
LBC-Automation/
├── LBC-Automation.bat              ← Lanceur principal
├── INSTRUCTIONS_PORTABLE.txt       ← Guide utilisateur
├── node-portable/                  ← Node.js v18.19.0 (~60 MB)
│   ├── node.exe
│   └── npm.cmd
└── app/                            ← Votre application (~80 MB)
    ├── src/
    ├── public/
    ├── node_modules/
    ├── service_account.json
    └── package.json
```

### Taille Totale

- **~140-180 MB** (selon les dépendances)
- Compressé en .zip : **~50-70 MB**

---

## 📦 Créer le Package Final

### Option 1 : Via l'Explorateur Windows

1. Sélectionnez le dossier complet `LBC-Automation`
2. Clic droit → "Envoyer vers" → "Dossier compressé"
3. Renommez le .zip : `LBC-Automation-v1.0-YYYYMMDD.zip`

### Option 2 : Via PowerShell

```powershell
Compress-Archive -Path LBC-Automation -DestinationPath LBC-Automation-v1.0.zip
```

---

## 📧 Livraison au Client

### Ce que Vous Envoyez

✅ `LBC-Automation-v1.0.zip` (~50-70 MB compressé)

### Instructions pour le Client

```
1. Décompressez le fichier .zip
2. Ouvrez le dossier décompressé
3. Double-cliquez sur "LBC-Automation.bat"
4. Patientez quelques secondes
5. Votre navigateur s'ouvre automatiquement
6. Utilisez l'application !
```

---

## 🔄 Mises à Jour Futures

Pour mettre à jour l'application chez le client :

### Mise à Jour Légère (Code uniquement)

1. Retirez le frontend + backend
2. Compressez uniquement le dossier `app/`
3. Envoyez `app-update.zip` au client
4. Le client remplace son dossier `app/` par le nouveau

### Mise à Jour Complète

Recréez tout le package avec `setup-portable.ps1` et renvoyez le .zip complet.

---

## 🆘 Dépannage

### Le script PowerShell ne s'exécute pas

**Erreur :** `Impossible de charger le fichier... car l'exécution de scripts est désactivée`

**Solution :**
```powershell
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
```

### Échec du téléchargement de Node.js

**Cause :** Problème réseau ou proxy

**Solution :**
1. Téléchargez manuellement : https://nodejs.org/dist/v18.19.0/node-v18.19.0-win-x64.zip
2. Placez le .zip à la racine du projet
3. Relancez `setup-portable.ps1`

### Le .bat ne trouve pas Node.js

**Cause :** Structure de dossiers incorrecte

**Solution :**
Vérifiez que :
- `node-portable\node.exe` existe
- `app\src\server.js` existe
- Tous les fichiers sont au bon endroit

---

## ✅ Checklist Avant Livraison

- [ ] Frontend buildé et copié dans `backend/public`
- [ ] `setup-portable.ps1` exécuté avec succès
- [ ] `LBC-Automation.bat` se lance sans erreur
- [ ] Le navigateur s'ouvre automatiquement
- [ ] L'interface React s'affiche
- [ ] Les emails se chargent
- [ ] Un clic sur un email fonctionne
- [ ] `service_account.json` est présent dans `app/`
- [ ] `INSTRUCTIONS_PORTABLE.txt` est à jour
- [ ] Le .zip est créé et testé

---

## 🎉 C'est Terminé !

Votre application portable est prête à être livrée !

**Points forts de cette solution :**
- ✅ 100% fonctionnel
- ✅ Aucune installation requise
- ✅ Simple pour l'utilisateur final
- ✅ Facile à maintenir

---

**Bon déploiement ! 🚀**
