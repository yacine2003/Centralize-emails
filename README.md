# 📧 Centralize Emails - Leboncoin

Solution complète pour centraliser les emails Leboncoin depuis plusieurs comptes Gmail et les afficher dans une interface web moderne. Permet également l'ouverture automatique des liens Leboncoin avec connexion automatisée.

![Stack](https://img.shields.io/badge/Stack-React%20%2B%20Node.js-blue)
![Status](https://img.shields.io/badge/Status-Ready-green)

## 🎯 Fonctionnalités

✅ **Centralisation des emails** : Récupère automatiquement les emails Leboncoin depuis plusieurs comptes Gmail  
✅ **Configuration via Google Sheets** : Gestion simple des comptes via un tableur  
✅ **Interface moderne** : UI React élégante et responsive  
✅ **Connexion automatisée** : Ouvre les liens Leboncoin en se connectant automatiquement  
✅ **Support multi-comptes** : Gérez autant de comptes Gmail que nécessaire  

## 🏗️ Architecture

```
Centralize-emails/
├── backend/              # API Node.js/Express
│   ├── src/
│   │   ├── services/    # Google Sheets, IMAP, Leboncoin
│   │   ├── routes/      # API Routes
│   │   └── server.js    # Serveur Express
│   └── package.json
│
├── frontend/            # Application React
│   ├── src/
│   │   ├── components/  # Composants React
│   │   └── App.js
│   └── package.json
│
└── service_account.json # Credentials Google (à ne pas commiter)
```

## 🚀 Installation

### Prérequis

- Node.js 16+ et npm
- Un compte Google Cloud Platform
- Un ou plusieurs comptes Gmail
- Un ou plusieurs comptes Leboncoin

### Étape 1 : Configuration Google Cloud

1. **Créer un projet Google Cloud** :
   - Aller sur https://console.cloud.google.com/
   - Créer un nouveau projet

2. **Activer l'API Google Sheets** :
   - Dans le menu, aller dans "API et services" > "Bibliothèque"
   - Rechercher "Google Sheets API"
   - Cliquer sur "Activer"

3. **Créer un Service Account** :
   - Aller dans "API et services" > "Identifiants"
   - Cliquer sur "Créer des identifiants" > "Compte de service"
   - Remplir les informations et créer
   - Cliquer sur le compte créé
   - Onglet "Clés" > "Ajouter une clé" > "Créer une clé" > Format JSON
   - Le fichier se télécharge automatiquement
   - Copier ce fichier à la racine du projet ET dans le dossier backend avec le nom `service_account.json`

### Étape 2 : Configuration Google Sheet

1. **Créer un nouveau Google Sheet** avec les colonnes suivantes :

| ID | IMAP_Email | IMAP_Password | LBC_Password |
|----|------------|---------------|--------------|
| 1 | email1@gmail.com | xxxx xxxx xxxx xxxx | motdepasse123 |
| 2 | email2@gmail.com | yyyy yyyy yyyy yyyy | motdepasse456 |

2. **Générer les mots de passe d'application Gmail** :
   - Aller sur https://myaccount.google.com/security
   - Activer la validation en 2 étapes si ce n'est pas déjà fait
   - Aller dans "Mots de passe des applications"
   - Sélectionner "Mail" et votre appareil
   - Copier le mot de passe généré (16 caractères) dans la colonne `IMAP_Password`

3. **Partager le Google Sheet** :
   - Cliquer sur "Partager" en haut à droite
   - Ajouter l'email du service account (trouvé dans `service_account.json`, champ `client_email`)
   - Donner les droits en "Lecteur"

4. **Récupérer l'ID du Sheet** :
   - L'ID se trouve dans l'URL : `https://docs.google.com/spreadsheets/d/[SPREADSHEET_ID]/edit`

### Étape 3 : Installation Backend

```bash
cd backend
npm install
```

Créer un fichier `.env` dans le dossier backend :
```env
PORT=3001
NODE_ENV=development
```

### Étape 4 : Installation Frontend

```bash
cd frontend
npm install
```

## 🎮 Utilisation

### Démarrer le Backend

```bash
cd backend
npm start
```

Le serveur démarre sur http://localhost:3001

### Démarrer le Frontend

```bash
cd frontend
npm start
```

L'application s'ouvre sur http://localhost:3000

### Utiliser l'application

1. **Entrer l'ID du Google Sheet** dans le champ prévu
2. **Cliquer sur "Rafraîchir les emails"** pour charger tous les emails Leboncoin
3. **Cliquer sur un email** pour ouvrir automatiquement le lien Leboncoin avec connexion

## 📚 API Backend

### Endpoints disponibles

#### GET `/api/health`
Vérifie que l'API fonctionne.

#### GET `/api/emails/leboncoin?spreadsheetId=<ID>`
Récupère tous les emails Leboncoin.

**Réponse :**
```json
{
  "emails": [...],
  "count": 25,
  "accountsProcessed": 3
}
```

#### POST `/api/emails/open`
Ouvre un lien Leboncoin avec connexion automatisée.

**Body :**
```json
{
  "url": "https://www.leboncoin.fr/...",
  "email": "email@example.com",
  "password": "mot_de_passe_lbc",
  "accountId": "optional"
}
```

#### POST `/api/browser/close`
Ferme le navigateur Puppeteer.

## 🔧 Technologies utilisées

### Backend
- **Node.js** + **Express** : API REST
- **google-spreadsheet** : Lecture Google Sheets
- **imap** + **mailparser** : Récupération emails Gmail
- **puppeteer** : Automatisation navigateur Leboncoin

### Frontend
- **React** : Framework UI
- **CSS3** : Design moderne et responsive

## ⚠️ Sécurité

🔒 **Important** :
- Ne jamais commiter le fichier `service_account.json`
- Ne jamais commiter le fichier `.env`
- Utiliser des mots de passe d'application Gmail (jamais les vrais mots de passe)
- Les mots de passe Leboncoin sont stockés dans le Google Sheet (à protéger)
- Le navigateur Puppeteer s'ouvre en mode visible pour plus de sécurité

## 🐛 Dépannage

### Erreur "spreadsheetId requis"
➡️ Vérifiez que vous avez bien entré l'ID du Google Sheet

### Erreur IMAP
➡️ Vérifiez que vous avez généré un mot de passe d'application Gmail  
➡️ Vérifiez que la validation en 2 étapes est activée

### Erreur Google Sheets
➡️ Vérifiez que le Sheet est bien partagé avec l'email du service account  
➡️ Vérifiez que l'API Google Sheets est activée dans Google Cloud

### Erreur Leboncoin
➡️ Vérifiez que les identifiants Leboncoin sont corrects  
➡️ Leboncoin peut détecter l'automatisation et demander des CAPTCHAs

## 📝 Notes

- Les emails sont triés du plus récent au plus ancien
- Le navigateur Puppeteer reste ouvert pour permettre plusieurs ouvertures
- Utilisez l'endpoint `/api/browser/close` pour fermer le navigateur

## 🤝 Contribution

Ce projet est un outil personnel. N'hésitez pas à le forker et l'adapter à vos besoins !

## 📄 Licence

MIT License - Libre d'utilisation

---

Développé avec ❤️ pour simplifier la gestion des emails Leboncoin
