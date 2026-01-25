# 🆘 Dépannage Electron Builder - Erreur winCodeSign

## ❌ Problème : "Cannot create symbolic link"

Cette erreur survient car `electron-builder` essaie de créer des liens symboliques macOS sur Windows, ce qui nécessite des privilèges administrateur.

---

## ✅ Solution 1 : Lancer en Tant qu'Administrateur (Recommandé)

### Option A : Utiliser le Script Automatique

```cmd
cd backend
build-as-admin.bat
```

Le script demande automatiquement les droits administrateur.

### Option B : Manuellement

1. **Clic droit sur PowerShell** → "Exécuter en tant qu'administrateur"
2. Naviguez vers le dossier backend :
   ```cmd
   cd C:\Users\adame\Downloads\Centralize-emails-creation_exe\Centralize-emails-creation_exe\backend
   ```
3. Lancez le build :
   ```cmd
   npm run build-win
   ```

---

## ✅ Solution 2 : Ignorer les Erreurs winCodeSign

Les erreurs de winCodeSign peuvent être ignorées si le build continue. Vérifiez si le fichier `.exe` est créé malgré les erreurs :

```cmd
dir dist-electron\*.exe
```

Si le fichier existe, **le build a réussi malgré les erreurs** ! ✅

---

## ✅ Solution 3 : Nettoyer Complètement le Cache

```cmd
REM Supprimer TOUT le cache electron-builder
rmdir /s /q %LOCALAPPDATA%\electron-builder\Cache

REM Relancer le build
npm run build-win
```

---

## ✅ Solution 4 : Utiliser la Version Portable Node.js (Alternative)

Si Electron continue à poser problème, utilisez la **solution portable Node.js** qui fonctionne à 100% :

**📚 [Guide Version Portable](./BUILD_PORTABLE.md)**

Cette solution est **plus fiable** et **plus simple** pour le client final.

---

## 🔍 Vérifier si le Build a Réussi

Même avec des erreurs winCodeSign, le build peut avoir réussi. Vérifiez :

```cmd
dir dist-electron
```

Vous devriez voir :
- `LBC Automation.exe` (version portable)
- OU `win-unpacked\LBC Automation.exe`

Si ces fichiers existent, **le build a réussi** ! Les erreurs winCodeSign sont juste des warnings.

---

## 💡 Pourquoi Cette Erreur ?

`electron-builder` télécharge `winCodeSign` même quand la signature est désactivée. C'est un bug connu. Les fichiers macOS dans winCodeSign contiennent des liens symboliques que Windows ne peut pas créer sans privilèges admin.

**Solution :** Lancer en tant qu'administrateur OU ignorer les erreurs si le build se termine.

---

## 🎯 Recommandation Finale

**Pour un usage interne/personnel :**
- ✅ Utilisez la **version portable Node.js** (plus simple, plus fiable)
- ✅ OU lancez Electron en tant qu'administrateur

**Pour une distribution publique :**
- ✅ Il faudrait signer le code avec un certificat (coûteux)
- ✅ OU utiliser un service de signature automatique

---

**Essayez d'abord la Solution 1 (administrateur) ! 🚀**
