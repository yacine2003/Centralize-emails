# Backend - Centralize Emails Leboncoin

Backend Node.js/Express pour centraliser les emails Leboncoin depuis plusieurs comptes Gmail via Google Sheets.

## 🚀 Installation

```bash
cd backend
npm install
```

## ⚙️ Configuration

1. **Créer le fichier `.env`** à la racine du dossier backend :

```env
PORT=3001
NODE_ENV=development
```

2. **Service Account Google** : Le fichier `service_account.json` doit être présent dans le dossier backend.

3. **Google Sheet** : 
   - Créer un Google Sheet avec les colonnes suivantes :
     - `ID` : Identifiant unique (optionnel)
     - `IMAP_Email` : Adresse email Gmail
     - `IMAP_Password` : Mot de passe d'application Gmail
     - `LBC_Password` : Mot de passe Leboncoin
   
   - Partager le Google Sheet avec l'email du service account :
     `lbc-automation@lbc-automation-483321.iam.gserviceaccount.com`

4. **Mot de passe d'application Gmail** :
   - Aller sur https://myaccount.google.com/security
   - Activer la validation en 2 étapes
   - Générer un mot de passe d'application dans "Mots de passe des applications"

## 🏃 Lancement

```bash
# Mode développement (avec auto-reload)
npm run dev

# Mode production
npm start
```

Le serveur démarre sur http://localhost:3001

## 📡 API Endpoints

### 1. Health Check
```
GET /api/health
```
Vérifie que l'API fonctionne.

### 2. Récupérer les emails Leboncoin
```
GET /api/emails/leboncoin?spreadsheetId=<SHEET_ID>
```
Récupère tous les emails Leboncoin depuis tous les comptes Gmail configurés dans le Google Sheet.

**Paramètres :**
- `spreadsheetId` : ID du Google Sheet (requis)

**Réponse :**
```json
{
  "emails": [...],
  "count": 25,
  "accountsProcessed": 3
}
```

### 3. Ouvrir un lien Leboncoin
```
POST /api/emails/open
Content-Type: application/json

{
  "url": "https://www.leboncoin.fr/...",
  "email": "email@example.com",
  "password": "mot_de_passe_lbc",
  "accountId": "optional_account_id"
}
```
Ouvre automatiquement un lien Leboncoin en se connectant au compte.

### 4. Fermer le navigateur
```
POST /api/browser/close
```
Ferme le navigateur Puppeteer.

## 🏗️ Architecture

```
backend/
├── src/
│   ├── services/
│   │   ├── googleSheetsService.js  # Connexion Google Sheets
│   │   ├── imapService.js          # Récupération emails IMAP
│   │   └── leboncoinService.js     # Automatisation Leboncoin
│   ├── routes/
│   │   └── emails.js               # Routes API
│   └── server.js                   # Serveur Express
├── service_account.json            # Credentials Google
├── package.json
└── .env
```

## 🔧 Dépendances principales

- **express** : Framework web
- **cors** : Gestion des CORS
- **google-spreadsheet** : API Google Sheets
- **imap** : Protocole IMAP pour Gmail
- **mailparser** : Parsing des emails
- **puppeteer** : Automatisation navigateur
- **dotenv** : Variables d'environnement

## 🐛 Débogage

Les logs sont affichés dans la console avec des emojis pour faciliter la lecture :
- 🚀 : Démarrage
- ✅ : Succès
- ❌ : Erreur
- 📧 : Email
- 🔐 : Authentification
- 🌐 : Navigateur

## 🔒 Sécurité

⚠️ **Important** :
- Ne jamais commiter le fichier `service_account.json`
- Ne jamais commiter le fichier `.env`
- Utiliser des mots de passe d'application Gmail (pas les vrais mots de passe)
- Le navigateur Puppeteer s'ouvre en mode visible pour des raisons de sécurité
