# 🔗 Guide de Connexion à GitHub

## Étapes pour Connecter le Projet à GitHub

### 1. Créer un Nouveau Dépôt sur GitHub

1. Allez sur [GitHub](https://github.com) et connectez-vous
2. Cliquez sur le bouton **"New"** (ou **"+"** en haut à droite > **"New repository"**)
3. Configurez votre dépôt :
   - **Repository name** : `ttr-ambassador-program` (ou un nom de votre choix)
   - **Description** : `Programme Ambassadeur TTR - Application PWA de gestion de programme d'affiliation`
   - **Visibility** : 
     - ✅ **Private** (recommandé pour un projet professionnel)
     - ❌ **Public** (uniquement si vous voulez rendre le code open-source)
   - ⚠️ **NE COCHEZ PAS** :
     - "Add a README file"
     - "Add .gitignore"
     - "Choose a license"
   
   (Ces fichiers existent déjà dans votre projet local)

4. Cliquez sur **"Create repository"**

### 2. Connecter Votre Projet Local au Dépôt GitHub

GitHub vous affichera des instructions. Utilisez la **deuxième option** ("push an existing repository from the command line").

Ouvrez PowerShell dans le dossier de votre projet et exécutez :

```powershell
# Ajoutez l'URL de votre dépôt GitHub comme remote
git remote add origin https://github.com/VOTRE_USERNAME/ttr-ambassador-program.git

# Renommez la branche principale en 'main' (standard GitHub)
git branch -M main

# Poussez votre code vers GitHub
git push -u origin main
```

**Remplacez** `VOTRE_USERNAME` par votre nom d'utilisateur GitHub réel.

### 3. Authentification GitHub

Lors du premier `git push`, GitHub vous demandera de vous authentifier :

#### Option A : Personal Access Token (Recommandé)

1. Allez dans **GitHub Settings** > **Developer settings** > **Personal access tokens** > **Tokens (classic)**
2. Cliquez sur **"Generate new token (classic)"**
3. Donnez un nom au token : `TTR Ambassador App`
4. Sélectionnez les permissions :
   - ✅ `repo` (accès complet aux dépôts)
5. Cliquez sur **"Generate token"**
6. **Copiez le token immédiatement** (vous ne pourrez plus le voir après)
7. Lors du `git push`, utilisez le token comme mot de passe

#### Option B : GitHub CLI (Alternative)

```powershell
# Installez GitHub CLI
winget install GitHub.cli

# Authentifiez-vous
gh auth login

# Suivez les instructions interactives
```

### 4. Vérification

Une fois le push terminé, rafraîchissez la page de votre dépôt GitHub. Vous devriez voir tous vos fichiers.

## 🔐 Protection du Fichier .env.local

⚠️ **TRÈS IMPORTANT** : Le fichier `.env.local` est déjà dans `.gitignore` et ne sera **JAMAIS** envoyé sur GitHub.

**Pourquoi ?**
- Il contient vos clés API Firebase
- Il contient votre clé secrète `TTR_API_KEY`
- Ces informations sensibles doivent rester privées

**Pour les collaborateurs :**
- Partagez le fichier `.env.example` (qui ne contient pas de vraies valeurs)
- Envoyez les vraies valeurs par un canal sécurisé (pas par GitHub)

## 🚀 Workflow de Développement

### Après Chaque Modification

```powershell
# 1. Vérifiez les fichiers modifiés
git status

# 2. Ajoutez les fichiers modifiés
git add .

# 3. Créez un commit avec un message descriptif
git commit -m "Description de vos changements"

# 4. Poussez vers GitHub
git push
```

### Exemples de Messages de Commit

✅ **Bons messages** :
- `"Ajout de la fonctionnalité de notification push"`
- `"Fix: Correction du calcul des commissions"`
- `"Amélioration de l'interface du tableau de bord"`
- `"Update: Mise à jour des règles Firestore pour la sécurité"`

❌ **Mauvais messages** :
- `"update"`
- `"fix bug"`
- `"changes"`

### Créer une Nouvelle Branche (pour des fonctionnalités)

```powershell
# Créer et basculer sur une nouvelle branche
git checkout -b feature/nom-de-la-fonctionnalite

# Faire vos modifications, puis :
git add .
git commit -m "Description"
git push -u origin feature/nom-de-la-fonctionnalite

# Sur GitHub, créez une Pull Request pour fusionner avec 'main'
```

## 📋 Configuration Avancée

### Ajout de Collaborateurs

1. Sur GitHub, allez dans votre dépôt
2. **Settings** > **Collaborators**
3. Cliquez sur **"Add people"**
4. Entrez le nom d'utilisateur GitHub de votre collaborateur

### Protection de la Branche Main

1. **Settings** > **Branches** > **Add branch protection rule**
2. Branch name pattern : `main`
3. Activez :
   - ✅ **Require a pull request before merging**
   - ✅ **Require approvals** (si vous travaillez en équipe)

### Synchronisation d'un Ordinateur Différent

```powershell
# Clonez le dépôt
git clone https://github.com/VOTRE_USERNAME/ttr-ambassador-program.git

# Allez dans le dossier
cd ttr-ambassador-program

# Installez les dépendances
npm install

# Créez votre fichier .env.local (avec les vraies valeurs)
# Puis lancez l'app
npm run dev
```

## 🔄 Commandes Git Utiles

```powershell
# Voir l'historique des commits
git log --oneline

# Annuler les modifications non commitées
git restore .

# Voir les différences avant de commiter
git diff

# Récupérer les dernières modifications depuis GitHub
git pull

# Voir toutes les branches
git branch -a

# Supprimer une branche locale
git branch -d nom-de-la-branche

# Supprimer une branche sur GitHub
git push origin --delete nom-de-la-branche
```

## ⚙️ Configuration GitHub Actions (CI/CD - Optionnel)

Créez `.github/workflows/deploy.yml` pour automatiser les tests et le déploiement :

```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      env:
        NEXT_PUBLIC_FIREBASE_API_KEY: ${{ secrets.NEXT_PUBLIC_FIREBASE_API_KEY }}
        # Ajoutez toutes vos variables d'environnement ici
    
    - name: Deploy to Firebase
      uses: FirebaseExtended/action-hosting-deploy@v0
      with:
        repoToken: ${{ secrets.GITHUB_TOKEN }}
        firebaseServiceAccount: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
        projectId: your-firebase-project-id
```

**Configuration des Secrets** :
1. Sur GitHub : **Settings** > **Secrets and variables** > **Actions**
2. Ajoutez chaque variable d'environnement comme secret

## 🆘 Problèmes Courants

### "Permission denied (publickey)"
```powershell
# Utilisez HTTPS au lieu de SSH
git remote set-url origin https://github.com/VOTRE_USERNAME/ttr-ambassador-program.git
```

### "Repository not found"
- Vérifiez que le nom du dépôt est correct
- Vérifiez que vous avez les droits d'accès

### Fichier .env.local envoyé par erreur
```powershell
# Supprimez du cache Git (mais pas du disque)
git rm --cached .env.local

# Commitez la suppression
git commit -m "Remove .env.local from tracking"
git push
```

**Important** : Si cela arrive, **changez immédiatement toutes vos clés API** car elles sont maintenant publiques dans l'historique Git !

## ✅ Checklist Finale

Avant de pousser vers GitHub, vérifiez :

- [ ] Le fichier `.env.local` est dans `.gitignore`
- [ ] Aucune clé API ou secret n'est en dur dans le code
- [ ] Le fichier `.env.example` existe (sans vraies valeurs)
- [ ] Le README.md est à jour
- [ ] Les dépendances sont à jour (`package.json`)
- [ ] Le projet se build correctement (`npm run build`)

## 🎉 Prochaines Étapes

Une fois votre code sur GitHub :
1. Configurez Firebase App Hosting ou Vercel pour le déploiement automatique
2. Mettez en place des GitHub Actions pour les tests automatiques
3. Créez des issues pour suivre les bugs et fonctionnalités
4. Utilisez les Discussions pour échanger avec votre équipe

---

**Félicitations !** Votre projet est maintenant versionné et sauvegardé sur GitHub ! 🚀
