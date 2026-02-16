# 🚀 ÉTAPES RAPIDES POUR CONNECTER À GITHUB

## ✅ Ce qui est déjà fait :
- ✅ Git est initialisé
- ✅ Fichier .gitignore configuré (protège .env.local et autres fichiers sensibles)
- ✅ 2 commits créés avec tout le code du projet
- ✅ Guides de déploiement créés (DEPLOYMENT.md et GITHUB_SETUP.md)

---

## 📋 CE QU'IL VOUS RESTE À FAIRE :

### Étape 1 : Créer le Dépôt sur GitHub
1. Allez sur https://github.com
2. Cliquez sur le bouton vert **"New"** (ou le "+" en haut à droite)
3. Configurez :
   - **Repository name** : `ttr-ambassador-program`
   - **Description** : `Programme Ambassadeur TTR - Application PWA de gestion de programme d'affiliation`
   - **Visibilité** : **Private** (recommandé)
   - ⚠️ **NE COCHEZ RIEN d'autre** (pas de README, .gitignore ou license)
4. Cliquez sur **"Create repository"**

---

### Étape 2 : Copier l'URL de votre Dépôt

GitHub vous affichera une page avec des instructions.

**Copiez l'URL HTTPS** qui ressemble à :
```
https://github.com/VOTRE_USERNAME/ttr-ambassador-program.git
```

---

### Étape 3 : Exécuter les Commandes

Ouvrez **PowerShell** dans le dossier `C:\Users\SSD\Desktop\abt` et exécutez :

```powershell
# Remplacez VOTRE_USERNAME par votre nom d'utilisateur GitHub réel !
git remote add origin https://github.com/VOTRE_USERNAME/ttr-ambassador-program.git

# Renommez la branche en 'main'
git branch -M main

# Poussez tout vers GitHub
git push -u origin main
```

---

### Étape 4 : Authentification

Lors du `git push`, GitHub vous demandera de vous authentifier.

#### Option A : Token Personnel (Recommandé)

1. Allez sur GitHub → **Settings** (votre profil) → **Developer settings** → **Personal access tokens** → **Tokens (classic)**
2. Cliquez sur **"Generate new token (classic)"**
3. Donnez un nom : `TTR Ambassador`
4. Cochez : ✅ **repo** (tous les sous-items)
5. Cliquez sur **"Generate token"**
6. **COPIEZ LE TOKEN IMMÉDIATEMENT** (vous ne le verrez plus jamais !)
7. Lors du `git push` :
   - **Username** : Votre nom d'utilisateur GitHub
   - **Password** : Collez le token (PAS votre mot de passe GitHub)

#### Option B : GitHub CLI (Alternative)

```powershell
# Installez GitHub CLI
winget install GitHub.cli

# Authentifiez-vous
gh auth login

# Suivez les instructions
```

---

## 🎉 VÉRIFICATION FINALE

1. Allez sur `https://github.com/VOTRE_USERNAME/ttr-ambassador-program`
2. Rafraîchissez la page
3. Vous devriez voir tous vos fichiers ! 🎊

---

## 📝 RÉSUMÉ DES COMMANDES (copier-coller)

**⚠️ Remplacez `VOTRE_USERNAME` par votre vrai nom d'utilisateur GitHub !**

```powershell
# 1. Lier au dépôt GitHub
git remote add origin https://github.com/VOTRE_USERNAME/ttr-ambassador-program.git

# 2. Renommer la branche
git branch -M main

# 3. Pousser vers GitHub
git push -u origin main
```

---

## 🔐 SÉCURITÉ - IMPORTANT !

✅ **Le fichier `.env.local` est protégé et NE sera JAMAIS envoyé sur GitHub**

Vérifiez que `.env.local` apparaît dans le fichier `.gitignore` :
```powershell
# Pour vérifier
cat .gitignore | Select-String "env.local"
```

Résultat attendu :
```
.env*.local
.env.local
.env
```

---

## 📚 PROCHAINES ÉTAPES

Après avoir connecté à GitHub :

1. 📖 Lisez `DEPLOYMENT.md` pour configurer Firebase et déployer
2. 🔄 Utilisez `GITHUB_SETUP.md` pour le workflow quotidien (commits, pull, push)
3. 🚀 Configurez le déploiement continu sur Firebase ou Vercel

---

## 🆘 EN CAS DE PROBLÈME

### "Repository not found"
→ Vérifiez que vous avez bien créé le dépôt sur GitHub et que l'URL est correcte

### "Permission denied"
→ Utilisez un token personnel au lieu de votre mot de passe

### "Already exists" lors de `git remote add`
→ Supprimez d'abord : `git remote remove origin`
→ Puis recommencez avec `git remote add origin ...`

### Fichier sensible envoyé par erreur
→ Contactez immédiatement pour résoudre (changement de clés nécessaire)

---

## 📞 SUPPORT

Questions ? Consultez les guides détaillés :
- `GITHUB_SETUP.md` - Guide complet GitHub
- `DEPLOYMENT.md` - Guide de déploiement Firebase
- `readme.technical.md` - Documentation technique

---

**Bon courage ! 🚀**
