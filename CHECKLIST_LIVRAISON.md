# ✅ Checklist de Livraison - LBC Automation

Utilisez cette checklist pour vous assurer que tout est prêt avant de livrer le projet au client.

---

## 📋 Avant le Build

### 1. Code et Configuration

- [ ] Le Google Sheet ID est codé en dur dans le frontend (`EmailList.jsx`)
- [ ] Le fichier `service_account.json` est bien présent dans le dossier `backend`
- [ ] Le fichier `.env` est configuré correctement (si utilisé)
- [ ] Toutes les dépendances sont installées (`npm install` dans frontend et backend)
- [ ] Le code a été testé en développement (frontend + backend séparés)

### 2. Tests Fonctionnels

- [ ] ✅ Récupération des emails fonctionne
- [ ] ✅ Filtres par catégorie fonctionnent
- [ ] ✅ Filtres par compte fonctionnent
- [ ] ✅ Ouverture d'un email "message" avec connexion auto fonctionne
- [ ] ✅ Ouverture d'une annonce publiée/supprimée/refusée fonctionne
- [ ] ✅ Gestion des captchas fonctionne
- [ ] ✅ Gestion des popups cookies fonctionne

---

## 🔨 Préparation du Build

### 3. Build du Projet

- [ ] Frontend buildé : `cd frontend && npm run build`
- [ ] Build copié dans backend : `cp -r frontend/build/* backend/public/`
- [ ] Application unifiée testée : `cd backend && npm start` (doit servir le frontend)
- [ ] Vérification sur `http://localhost:3001` (tout fonctionne)

### 4. Fichiers à Inclure

- [ ] `service_account.json` présent dans `backend/`
- [ ] Dossier `backend/public/` contient le frontend
- [ ] Fichier `INSTRUCTIONS_CLIENT.txt` prêt à être inclus
- [ ] README ou documentation client préparée

---

## 💻 Build Windows (Sur Windows ou VM)

### 5. Transfert sur Windows

- [ ] Projet compressé (.zip)
- [ ] Transféré sur machine Windows
- [ ] Décompressé dans un dossier propre
- [ ] `cd backend && npm install` exécuté sur Windows

### 6. Création du .exe

- [ ] `pkg` installé globalement : `npm install -g pkg`
- [ ] Commande de build exécutée : `npm run build`
- [ ] Fichier `.exe` créé dans `backend/dist/`
- [ ] Taille du fichier vérifiée (doit être > 50 MB)

### 7. Test du .exe

- [ ] Double-clic sur le `.exe` → L'application démarre
- [ ] Le navigateur s'ouvre automatiquement sur `localhost:3001`
- [ ] Le frontend s'affiche correctement
- [ ] Les emails se chargent correctement
- [ ] Un clic sur un email ouvre le navigateur
- [ ] La connexion automatique fonctionne (pour les messages)

---

## 🌐 Chromium/Chrome

### 8. Navigateur pour Puppeteer

Choisissez une option :

**Option A : Chrome Local (Plus simple)**
- [ ] Le client a Google Chrome installé
- [ ] Le code pointe vers le chemin Chrome de Windows
- [ ] Testé avec le Chrome du système

**Option B : Chromium Portable (Recommandé)**
- [ ] Chromium portable téléchargé pour Windows
- [ ] Décompressé dans un dossier `chrome-win/`
- [ ] Placé à côté du `.exe`
- [ ] Testé : le bot utilise bien ce Chromium
- [ ] Chemin vérifié dans le code Puppeteer

---

## 📦 Préparation du Dossier Final

### 9. Structure du Dossier de Livraison

Créer un dossier `LBC-Automation-v1.0/` contenant :

- [ ] `LBC-Automation.exe` (le fichier exécutable)
- [ ] `service_account.json` (credentials Google)
- [ ] `INSTRUCTIONS_CLIENT.txt` (guide utilisateur)
- [ ] `chrome-win/` (si Chromium portable utilisé)
  - [ ] `chrome.exe` et tous les fichiers nécessaires

### 10. Vérifications Finales

- [ ] Tous les fichiers sont dans le dossier
- [ ] Aucun fichier sensible supplémentaire (.env de dev, logs, etc.)
- [ ] Aucun dossier inutile (node_modules, .git, etc.)
- [ ] Taille totale raisonnable (< 500 MB idéalement)

---

## 🧪 Test Final Avant Livraison

### 11. Test Complet sur Windows

- [ ] Décompresser le dossier final dans un nouvel emplacement
- [ ] Lancer `LBC-Automation.exe`
- [ ] Vérifier que tout fonctionne de A à Z :
  - [ ] Démarrage de l'application
  - [ ] Affichage du frontend
  - [ ] Chargement des emails
  - [ ] Filtrage des emails
  - [ ] Clic sur un email (message)
  - [ ] Connexion automatique réussie
  - [ ] Clic sur une annonce
  - [ ] Ouverture directe sans connexion
  - [ ] Résolution d'un captcha (si affiché)
  - [ ] Fermeture propre de l'application

### 12. Test avec un Utilisateur Non-Technique

- [ ] Donner le dossier à quelqu'un qui ne connaît pas le projet
- [ ] Observer s'il arrive à lancer et utiliser l'application
- [ ] Noter les difficultés rencontrées
- [ ] Améliorer les instructions si nécessaire

---

## 📤 Livraison

### 13. Compression et Envoi

- [ ] Dossier compressé en `.zip`
- [ ] Nom du fichier clair : `LBC-Automation-v1.0-YYYYMMDD.zip`
- [ ] Taille vérifiée (doit pouvoir être envoyé par email ou cloud)
- [ ] Checksum MD5/SHA256 généré (optionnel mais recommandé)

### 14. Documentation d'Accompagnement

- [ ] Email de livraison rédigé avec :
  - [ ] Résumé du projet
  - [ ] Instructions de décompression
  - [ ] Lien vers les instructions détaillées
  - [ ] Contact pour le support
- [ ] Vidéo de démo enregistrée (optionnel mais très utile)

### 15. Support Post-Livraison

- [ ] Planifier une session de support à distance
- [ ] Être disponible pour les premiers lancements
- [ ] Préparer un FAQ avec les erreurs courantes
- [ ] Documenter les problèmes rencontrés pour v1.1

---

## 🎉 C'est Prêt !

Une fois tous les points cochés, votre application est prête à être livrée !

### Derniers Rappels

- ⚠️ Ne jamais exposer `service_account.json` publiquement
- 📞 Rester disponible les premiers jours après la livraison
- 📝 Noter tous les bugs/suggestions pour la prochaine version
- 🔄 Planifier les mises à jour futures si nécessaire

---

**Bonne livraison ! 🚀**
