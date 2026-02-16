# Guide de Déploiement - Programme Ambassadeur TTR

## 🚀 Configuration Initiale

### 1. Prérequis
- Node.js 18+ installé
- Compte Firebase (avec projet configuré)
- Compte GitHub

### 2. Configuration Firebase

#### A. Firebase Console
1. Créez un nouveau projet sur [Firebase Console](https://console.firebase.google.com/)
2. Activez les services suivants :
   - **Authentication** : Activez la méthode Email/Password
   - **Firestore Database** : Créez une base en mode production
   - **Hosting** (optionnel) : Pour l'hébergement web

#### B. Récupération des Clés Firebase

**Pour le SDK Client :**
1. Allez dans `Project Settings` > `General`
2. Dans "Your apps", sélectionnez votre application Web
3. Copiez les valeurs de configuration

**Pour le SDK Admin :**
1. Allez dans `Project Settings` > `Service Accounts`
2. Cliquez sur "Generate new private key"
3. Téléchargez le fichier JSON

### 3. Configuration des Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet :

```env
# Configuration Firebase Client (depuis la console Firebase)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789:web:abcdef

# Email de l'administrateur principal
NEXT_PUBLIC_ADMIN_EMAIL=ttrbuzi@gmail.com

# Configuration Firebase Admin (depuis le fichier JSON de service account)
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xxxxx@your-project.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nVOTRE_CLE_PRIVEE_ICI\n-----END PRIVATE KEY-----\n"

# Clé API pour le webhook externe
TTR_API_KEY=votre_cle_secrete_ultra_longue_et_complexe_ici

# Google Analytics (optionnel)
NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

⚠️ **Important pour `FIREBASE_PRIVATE_KEY`** :
- La clé doit être entourée de guillemets doubles
- Les sauts de ligne doivent être des `\n` littéraux
- Exemple : `"-----BEGIN PRIVATE KEY-----\nMIIEvQI...\n-----END PRIVATE KEY-----\n"`

### 4. Installation des Dépendances

```bash
npm install
```

### 5. Déploiement des Règles de Sécurité Firestore

```bash
# Installez Firebase CLI si ce n'est pas déjà fait
npm install -g firebase-tools

# Connectez-vous à Firebase
firebase login

# Initialisez Firebase dans votre projet (si pas déjà fait)
firebase init firestore

# Déployez les règles de sécurité
firebase deploy --only firestore:rules
```

### 6. Configuration de l'Administrateur Initial

**Important** : Après le déploiement, créez un compte utilisateur avec l'email défini dans `NEXT_PUBLIC_ADMIN_EMAIL`.

1. Lancez l'application localement : `npm run dev`
2. Allez sur `/login`
3. Créez un compte avec l'email `ttrbuzi@gmail.com` (ou celui que vous avez défini)
4. Cet utilisateur aura automatiquement les privilèges administrateur

Pour ajouter d'autres administrateurs, mettez à jour les règles Firestore dans `firestore.rules` :

```javascript
function isAdmin() {
  return request.auth.uid == 'UID_ADMIN_1' || request.auth.uid == 'UID_ADMIN_2';
}
```

## 📦 Déploiement en Production

### Option 1 : Firebase App Hosting (Recommandé)

```bash
# Installez Firebase CLI
npm install -g firebase-tools

# Connectez-vous
firebase login

# Initialisez Firebase App Hosting
firebase init apphosting

# Déployez
firebase deploy --only apphosting
```

### Option 2 : Vercel

1. Connectez votre dépôt GitHub à Vercel
2. Configurez les variables d'environnement dans les paramètres du projet
3. Déployez automatiquement à chaque push

### Option 3 : Build Manuel

```bash
# Build de production
npm run build

# Démarrez le serveur
npm start
```

## 🔐 Sécurité Post-Déploiement

### 1. Mise à jour de l'UID Admin dans Firestore Rules

Après avoir créé le compte admin :
1. Récupérez l'UID du compte admin depuis Firebase Console > Authentication
2. Mettez à jour `firestore.rules` :

```javascript
function isAdmin() {
  return request.auth.uid == 'VOTRE_UID_ADMIN_REEL';
}
```

3. Redéployez les règles : `firebase deploy --only firestore:rules`

### 2. Configuration du Webhook pour TTRGESTION

Dans votre application principale TTRGESTION, configurez l'endpoint du webhook :

**URL** : `https://votre-domaine.com/api/verify-code`

**Headers** :
```
Authorization: Bearer VOTRE_TTR_API_KEY
Content-Type: application/json
```

**Payload** :
```json
{
  "promoCode": "CODE_PROMO",
  "clientUid": "uid_du_client",
  "action": "signup" // ou "activate"
}
```

## 🧪 Tests

### Test Local
```bash
npm run dev
# Visitez http://localhost:9004
```

### Test de Build
```bash
npm run build
npm start
```

### Test du Webhook
```bash
curl -X POST https://votre-domaine.com/api/verify-code \
  -H "Authorization: Bearer VOTRE_TTR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "promoCode": "TEST123",
    "clientUid": "test-client-uid",
    "action": "signup"
  }'
```

## 📊 Monitoring

### Firebase Console
- **Authentication** : Suivez les inscriptions
- **Firestore** : Surveillez l'utilisation de la base
- **Performance** : Analysez les performances de l'app

### Logs Next.js
```bash
# Mode développement avec logs détaillés
npm run dev

# Logs de production
npm start
```

## 🔄 Mise à Jour

### Déploiement d'une Nouvelle Version

```bash
# 1. Committez vos changements
git add .
git commit -m "Description des changements"
git push origin main

# 2. Redéployez sur Firebase
firebase deploy --only apphosting

# 3. (Si règles modifiées) Déployez les règles
firebase deploy --only firestore:rules
```

## 🆘 Dépannage

### Erreur "Permission Denied" sur Firestore
- Vérifiez que les règles Firestore sont bien déployées
- Vérifiez que l'UID admin est correct dans les règles

### Erreur d'Authentification Firebase
- Vérifiez que toutes les variables d'environnement sont correctement définies
- Assurez-vous que la méthode Email/Password est activée dans Firebase Console

### Webhook ne fonctionne pas
- Vérifiez que `TTR_API_KEY` est identique dans les deux applications
- Testez avec curl pour vérifier la connectivité
- Vérifiez les logs côté serveur

### Build échoue
```bash
# Nettoyez le cache
rm -rf .next node_modules
npm install
npm run build
```

## 📞 Support

Pour toute question technique :
- Email : ttrbuzi@gmail.com
- Documentation technique : Voir `readme.technical.md`
