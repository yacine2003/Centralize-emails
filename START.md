# 🚀 Démarrage Rapide

## Installation en 5 minutes

### 1️⃣ Installer les dépendances

```bash
# Backend
cd backend
npm install

# Frontend (dans un nouveau terminal)
cd frontend
npm install
```

### 2️⃣ Configurer le fichier .env

```bash
cd backend
cp .env.example .env
```

Le fichier `.env` contient déjà les bonnes valeurs par défaut.

### 3️⃣ Préparer votre Google Sheet

1. **Créer un Google Sheet** avec ces colonnes exactes :
   ```
   ID | IMAP_Email | IMAP_Password | LBC_Password
   ```

2. **Remplir avec vos comptes** (exemple) :
   ```
   1 | email@gmail.com | xxxx xxxx xxxx xxxx | motdepasse123
   ```

3. **Partager le Sheet** avec l'email du service account :
   - Ouvrir `service_account.json`
   - Copier la valeur de `client_email`
   - Partager le Sheet avec cet email (rôle : Lecteur)

4. **Copier l'ID du Sheet** depuis l'URL :
   ```
   https://docs.google.com/spreadsheets/d/[COPIEZ_CET_ID]/edit
   ```

### 4️⃣ Lancer l'application

**Terminal 1 - Backend :**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend :**
```bash
cd frontend
npm start
```

### 5️⃣ Utiliser l'application

1. L'application s'ouvre sur http://localhost:3000
2. Coller l'ID du Google Sheet
3. Cliquer sur "Rafraîchir les emails"
4. Cliquer sur un email pour l'ouvrir automatiquement

---

## ⚠️ Prérequis importants

### Mots de passe d'application Gmail

Pour chaque compte Gmail, vous devez générer un **mot de passe d'application** :

1. Aller sur https://myaccount.google.com/security
2. Activer la validation en 2 étapes
3. Générer un mot de passe d'application dans "Mots de passe des applications"
4. Copier le mot de passe de 16 caractères
5. Le mettre dans la colonne `IMAP_Password` du Google Sheet

### Service Account Google

Le fichier `service_account.json` doit être présent :
- À la racine du projet
- Dans le dossier `backend/`

Si vous ne l'avez pas, consultez le [GUIDE_UTILISATION.md](GUIDE_UTILISATION.md) section 1.

---

## 📚 Documentation complète

- [README.md](README.md) - Vue d'ensemble du projet
- [GUIDE_UTILISATION.md](GUIDE_UTILISATION.md) - Guide détaillé pas à pas
- [backend/README.md](backend/README.md) - Documentation technique du backend

---

## 🆘 Problèmes fréquents

### "Impossible de se connecter au serveur"
➡️ Vérifier que le backend est démarré (terminal 1)

### "spreadsheetId requis"
➡️ Entrer l'ID du Google Sheet dans le champ

### "Authentication failed" (IMAP)
➡️ Vérifier que vous avez bien généré un mot de passe d'application Gmail

### "The caller does not have permission"
➡️ Vérifier que le Google Sheet est partagé avec l'email du service account

---

## 🎉 C'est prêt !

Votre application devrait maintenant fonctionner. Bon usage ! 🚀

Pour plus d'aide, consultez le [GUIDE_UTILISATION.md](GUIDE_UTILISATION.md).
