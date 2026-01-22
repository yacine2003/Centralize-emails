# 📖 Guide d'utilisation détaillé - Centralize Emails Leboncoin

Ce guide vous accompagne pas à pas pour configurer et utiliser l'application.

## 📋 Table des matières

1. [Configuration initiale](#configuration-initiale)
2. [Préparation des comptes Gmail](#préparation-des-comptes-gmail)
3. [Configuration du Google Sheet](#configuration-du-google-sheet)
4. [Lancement de l'application](#lancement-de-lapplication)
5. [Utilisation quotidienne](#utilisation-quotidienne)
6. [Résolution de problèmes](#résolution-de-problèmes)

---

## 1. Configuration initiale

### 1.1 Google Cloud Platform

**Étape 1 : Créer un projet**
1. Aller sur https://console.cloud.google.com/
2. Cliquer sur le sélecteur de projet en haut
3. Cliquer sur "Nouveau projet"
4. Nommer le projet (ex: "LBC-Automation")
5. Cliquer sur "Créer"

**Étape 2 : Activer l'API Google Sheets**
1. Dans le menu ☰, aller dans "API et services" > "Bibliothèque"
2. Rechercher "Google Sheets API"
3. Cliquer sur la carte de l'API
4. Cliquer sur "Activer"

**Étape 3 : Créer un Service Account**
1. Dans le menu ☰, aller dans "API et services" > "Identifiants"
2. Cliquer sur "+ Créer des identifiants" en haut
3. Sélectionner "Compte de service"
4. Remplir :
   - Nom : "lbc-automation"
   - ID : lbc-automation (généré automatiquement)
5. Cliquer sur "Créer et continuer"
6. Cliquer sur "Continuer" (pas besoin de rôle)
7. Cliquer sur "OK"

**Étape 4 : Télécharger la clé JSON**
1. Dans la liste des comptes de service, cliquer sur celui que vous venez de créer
2. Aller dans l'onglet "Clés"
3. Cliquer sur "Ajouter une clé" > "Créer une clé"
4. Sélectionner "JSON"
5. Cliquer sur "Créer"
6. Le fichier `[projet]-[id].json` se télécharge
7. Renommer ce fichier en `service_account.json`
8. Le copier à la racine du projet ET dans le dossier `backend/`

### 1.2 Installation des dépendances

```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

---

## 2. Préparation des comptes Gmail

Pour chaque compte Gmail que vous souhaitez surveiller :

### 2.1 Activer la validation en 2 étapes

1. Aller sur https://myaccount.google.com/security
2. Trouver "Validation en 2 étapes"
3. Si ce n'est pas activé, cliquer sur "Commencer" et suivre les étapes

### 2.2 Générer un mot de passe d'application

1. Sur la même page (https://myaccount.google.com/security)
2. Descendre jusqu'à "Mots de passe des applications"
3. Cliquer dessus
4. Sélectionner :
   - Application : "Mail"
   - Appareil : "Autre" (nommer "LBC-Automation")
5. Cliquer sur "Générer"
6. **IMPORTANT** : Copier le mot de passe de 16 caractères affiché
7. Le conserver précieusement (vous en aurez besoin pour le Google Sheet)

**Répéter cette opération pour chaque compte Gmail.**

---

## 3. Configuration du Google Sheet

### 3.1 Créer le Google Sheet

1. Aller sur https://sheets.google.com/
2. Créer un nouveau tableur
3. Le nommer "LBC-Automation-Accounts"

### 3.2 Structurer le tableur

Créer les colonnes suivantes (exactement avec ces noms) :

| A | B | C | D |
|---|---|---|---|
| **ID** | **IMAP_Email** | **IMAP_Password** | **LBC_Password** |

### 3.3 Remplir les données

**Exemple de données :**

| ID | IMAP_Email | IMAP_Password | LBC_Password |
|----|------------|---------------|--------------|
| 1 | thomas.jardin759@gmail.com | abcd efgh ijkl mnop | Toto123@tout |
| 2 | marie.dupont@gmail.com | wxyz abcd efgh ijkl | MonMotDePasse456 |
| 3 | jean.martin@gmail.com | qrst uvwx yzab cdef | SecurePass789 |

**Explications :**
- **ID** : Numéro unique (1, 2, 3, etc.)
- **IMAP_Email** : Adresse Gmail complète
- **IMAP_Password** : Mot de passe d'application Gmail (16 caractères avec espaces)
- **LBC_Password** : Mot de passe du compte Leboncoin associé

⚠️ **IMPORTANT** : L'email Gmail peut être différent de l'email Leboncoin !

### 3.4 Partager le Google Sheet

1. Cliquer sur le bouton "Partager" en haut à droite
2. Ouvrir le fichier `service_account.json`
3. Copier la valeur du champ `client_email` (ex: `lbc-automation@...iam.gserviceaccount.com`)
4. Coller cet email dans le champ de partage
5. Sélectionner "Lecteur" comme rôle
6. **Décocher** "Avertir les utilisateurs"
7. Cliquer sur "Partager"

### 3.5 Récupérer l'ID du Sheet

1. Regarder l'URL de votre Google Sheet
2. Elle ressemble à : `https://docs.google.com/spreadsheets/d/1a2b3c4d5e6f7g8h9i0j/edit`
3. L'ID est la partie entre `/d/` et `/edit`
4. Dans cet exemple : `1a2b3c4d5e6f7g8h9i0j`
5. **Conserver cet ID**, vous en aurez besoin dans l'application

---

## 4. Lancement de l'application

### 4.1 Démarrer le backend

```bash
cd backend
npm start
```

Vous devriez voir :
```
╔═══════════════════════════════════════════════════╗
║                                                   ║
║   🚀 Serveur Centralize-Emails démarré           ║
║                                                   ║
║   📍 URL: http://localhost:3001                   ║
║   🌍 Environnement: development                   ║
║                                                   ║
╚═══════════════════════════════════════════════════╝
```

**Laisser ce terminal ouvert.**

### 4.2 Démarrer le frontend

Dans un **nouveau terminal** :

```bash
cd frontend
npm start
```

Le navigateur s'ouvre automatiquement sur http://localhost:3000

---

## 5. Utilisation quotidienne

### 5.1 Première utilisation

1. **Coller l'ID du Google Sheet** dans le champ en haut de la page
2. **Cliquer sur "🔄 Rafraîchir les emails"**
3. Patienter quelques secondes (peut prendre 10-30 secondes selon le nombre de comptes)
4. Les emails apparaissent triés du plus récent au plus ancien

### 5.2 Ouvrir un email Leboncoin

1. **Cliquer sur un email** dans la liste
2. Un navigateur Chrome s'ouvre automatiquement
3. L'application se connecte automatiquement à Leboncoin
4. Le lien de l'email s'ouvre

### 5.3 Rafraîchir les emails

- Cliquer à nouveau sur "🔄 Rafraîchir les emails" pour récupérer les nouveaux emails
- Vous pouvez fermer l'application et la relancer quand vous voulez

### 5.4 Fermer le navigateur automatisé

Le navigateur Chrome reste ouvert. Pour le fermer proprement :

**Option 1 : Via l'API**
```bash
curl -X POST http://localhost:3001/api/browser/close
```

**Option 2 : Fermer manuellement**
Fermer la fenêtre Chrome comme d'habitude

---

## 6. Résolution de problèmes

### ❌ "Impossible de se connecter au serveur"

**Cause** : Le backend n'est pas démarré  
**Solution** : Vérifier que le terminal avec `npm start` (backend) est ouvert et sans erreur

---

### ❌ "spreadsheetId requis en paramètre"

**Cause** : L'ID du Google Sheet n'est pas renseigné  
**Solution** : Coller l'ID du Sheet dans le champ prévu

---

### ❌ "Error: No values in the header row"

**Cause** : Les noms de colonnes ne sont pas corrects dans le Google Sheet  
**Solution** : Vérifier que les colonnes sont exactement nommées :
- `ID`
- `IMAP_Email`
- `IMAP_Password`
- `LBC_Password`

---

### ❌ "Error: The caller does not have permission"

**Cause** : Le Google Sheet n'est pas partagé avec le service account  
**Solution** :
1. Ouvrir `service_account.json`
2. Copier la valeur de `client_email`
3. Partager le Google Sheet avec cet email en tant que "Lecteur"

---

### ❌ Erreur IMAP "Authentication failed"

**Cause** : Mot de passe d'application incorrect ou pas généré  
**Solution** :
1. Vérifier que la validation en 2 étapes est activée sur Gmail
2. Générer un nouveau mot de passe d'application
3. Le copier exactement dans le Google Sheet (avec les espaces)

---

### ❌ "Aucun email Leboncoin trouvé"

**Causes possibles** :
1. Aucun email de Leboncoin dans la boîte de réception
2. Les emails sont dans un autre dossier (Spam, Promotions, etc.)

**Solutions** :
1. Vérifier manuellement si des emails Leboncoin existent
2. Déplacer les emails Leboncoin dans la boîte de réception principale

---

### ❌ Erreur Leboncoin lors de la connexion

**Causes possibles** :
1. Mot de passe Leboncoin incorrect
2. Leboncoin détecte l'automatisation
3. CAPTCHA demandé

**Solutions** :
1. Vérifier le mot de passe dans le Google Sheet
2. Attendre quelques minutes et réessayer
3. Si un CAPTCHA apparaît, le résoudre manuellement dans le navigateur ouvert

---

### ⚠️ Le navigateur s'ouvre mais ne se connecte pas

**Cause** : Les sélecteurs CSS de Leboncoin ont changé  
**Solution** : Contacter le développeur pour mettre à jour le code

---

## 💡 Conseils d'utilisation

### Sécurité
- ✅ Ne partagez jamais votre `service_account.json`
- ✅ Utilisez des mots de passe d'application Gmail (pas vos vrais mots de passe)
- ✅ Protégez l'accès à votre Google Sheet
- ✅ Ne commitez pas ces fichiers sur Git (déjà dans `.gitignore`)

### Performance
- 📊 Avec 3 comptes et 50 emails chacun, le chargement prend ~20 secondes
- 📊 Plus vous avez de comptes, plus c'est long
- 💡 Conseil : Limitez à 10-15 comptes maximum

### Bonnes pratiques
- 🔄 Rafraîchissez les emails régulièrement
- 🧹 Nettoyez votre boîte Gmail pour améliorer les performances
- 🔍 Utilisez les filtres Gmail pour mettre les emails Leboncoin dans un dossier spécifique

---

## 🎉 Vous êtes prêt !

L'application devrait maintenant fonctionner correctement. Bon usage ! 🚀
