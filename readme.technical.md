
# README Technique - Programme Ambassadeur TTR Gestion

Ce document fournit une vue d'ensemble technique détaillée de l'application "Programme Ambassadeur TTR Gestion". Il est destiné aux développeurs ou aux intelligences artificielles nécessitant de comprendre l'architecture, le flux de données et la logique métier du projet.

## 1. Vue d'ensemble de l'application

L'application est une plateforme web (PWA) conçue pour gérer un programme de marketing d'affiliation pour le produit principal "TTRGESTION". Les utilisateurs peuvent s'inscrire pour devenir "ambassadeurs", recevoir un code promotionnel unique, et gagner des commissions ("Monoyi") en référant de nouveaux clients.

L'application comprend deux interfaces principales :
1.  **Tableau de Bord Ambassadeur** : Pour que les utilisateurs suivent leurs clients, leurs gains, et accèdent à des ressources.
2.  **Tableau de Bord Administrateur** : Pour que l'administrateur gère les ambassadeurs, les paiements, les contenus, et envoie des notifications.

---

## 2. Pile Technologique (Tech Stack)

-   **Framework Frontend** : [Next.js](https://nextjs.org/) (avec App Router)
-   **Bibliothèque UI** : [React](https://react.dev/)
-   **Langage** : [TypeScript](https://www.typescriptlang.org/)
-   **Styling** : [Tailwind CSS](https://tailwindcss.com/)
-   **Composants UI** : [ShadCN/UI](https://ui.shadcn.com/)
-   **Backend & Base de Données** : [Firebase](https://firebase.google.com/) (Firestore, Authentication)
-   **Gestion de Formulaires** : React Hook Form (implicitement via les Server Actions)
-   **Déploiement** : Firebase App Hosting

---

## 3. Structure du Projet

```
.
├── public/                 # Fichiers statiques (images, manifest.json)
├── src/
│   ├── app/                # Cœur de l'application (Next.js App Router)
│   │   ├── (landing)/      # Pages publiques (accueil, mission, etc.)
│   │   ├── admin/          # Pages du tableau de bord administrateur
│   │   ├── dashboard/      # Pages du tableau de bord ambassadeur
│   │   ├── login/          # Page d'inscription et de connexion
│   │   ├── actions.ts      # Server Actions (logique backend principale)
│   │   ├── api/            # Routes API (ex: pour webhook externe)
│   │   ├── globals.css     # Styles globaux et variables de thème Tailwind/ShadCN
│   │   └── layout.tsx      # Layout principal de l'application
│   │
│   ├── components/         # Composants React réutilisables
│   │   ├── admin/          # Composants spécifiques à l'admin
│   │   ├── dashboard/      # Composants spécifiques au dashboard
│   │   ├── ui/             # Composants ShadCN (Button, Card, etc.)
│   │   └── icons/          # Icônes SVG personnalisées
│   │
│   ├── context/            # Providers de contexte React (ex: LoadingProvider)
│   │
│   ├── firebase/           # Configuration et hooks Firebase
│   │   ├── client-config.ts # Configuration du SDK client Firebase
│   │   ├── client-provider.tsx # Provider de contexte pour le client
│   │   ├── server-admin.ts  # Initialisation du SDK Admin Firebase (côté serveur)
│   │   └── firestore/       # Hooks personnalisés (useDoc, useCollection)
│   │
│   ├── hooks/              # Hooks React personnalisés (ex: useToast)
│   │
│   └── lib/                # Fonctions utilitaires et définitions de types
│       ├── api.ts          # Définitions des types de données (Ambassador, Payout, etc.)
│       └── utils.ts        # Utilitaires généraux (ex: cn pour classnames)
│
├── firebase.json           # Configuration de déploiement Firebase
├── firestore.rules         # Règles de sécurité pour la base de données Firestore
├── next.config.ts          # Configuration de Next.js
└── package.json            # Dépendances et scripts du projet
```

---

## 4. Architecture Frontend

### 4.1. Routing
L'application utilise le **App Router** de Next.js. La structure des dossiers dans `src/app` définit les URL.
-   Les pages publiques sont dans `src/app/(landing)`.
-   Les pages protégées sont dans `src/app/dashboard` et `src/app/admin`. La protection des routes est gérée dans les `layout.tsx` de ces dossiers, qui vérifient l'état d'authentification de l'utilisateur et son rôle (admin ou non).

### 4.2. Gestion de l'État et Récupération des Données
-   **État Local** : L'état des composants est géré avec les hooks React `useState` et `useEffect`.
-   **État Global** :
    -   `FirebaseProvider` (`src/firebase/provider.tsx`) fournit l'état d'authentification de l'utilisateur (`user`, `isUserLoading`) à toute l'application via un contexte.
    -   `LoadingProvider` (`src/context/loading-provider.tsx`) gère un état de chargement global pour les transitions de page.
-   **Récupération des Données Firestore** : Les données sont récupérées en temps réel grâce aux hooks personnalisés `useCollection` et `useDoc`. Ces hooks s'abonnent aux changements dans Firestore et mettent à jour l'interface utilisateur automatiquement.
    -   **Important** : Ces hooks sont conçus pour être utilisés avec `useMemoFirebase` pour éviter des ré-abonnements inutiles à chaque rendu, ce qui pourrait causer des fuites de mémoire ou des erreurs de performance.

### 4.3. Composants et Styling
-   L'interface est construite à partir de composants **ShadCN/UI**, qui sont des composants Radix UI stylisés avec Tailwind CSS.
-   Les styles personnalisés et les variables de thème (couleurs, polices, etc.) sont définis dans `src/app/globals.css`.
-   La logique de theming (clair/sombre) est gérée par `next-themes`.

---

## 5. Architecture Backend (Firebase & Server Actions)

### 5.1. Authentification
-   **Fournisseur** : Firebase Authentication avec la méthode `email/password`.
-   **Flux d'Inscription** :
    1.  L'utilisateur remplit le formulaire sur `/login`.
    2.  Le formulaire appelle l'action serveur `signupUser` (`src/app/actions.ts`).
    3.  Cette action **côté serveur** :
        a. Crée l'utilisateur dans Firebase Auth.
        b. Génère un `referralCode` unique basé sur le nom et l'UID de l'utilisateur, avec une logique de secours pour éviter les doublons.
        c. Crée un document dans la collection `users` et un document dans `ambassadors` en une seule transaction atomique (batch).
-   **Rôle Admin** : Un utilisateur est considéré comme administrateur si son email correspond à la variable d'environnement `NEXT_PUBLIC_ADMIN_EMAIL`. Les `layouts` et les règles de sécurité utilisent cette logique pour accorder des permissions spéciales.

### 5.2. Base de Données Cloud Firestore
La structure de la base de données est NoSQL et organisée en collections et sous-collections.

-   `/users/{userId}`
    -   **Objectif** : Stocke un profil utilisateur minimaliste dès l'inscription.
    -   **Contient** : `id`, `name`, `email`, `createdAt`, `isAmbassador`.

-   `/ambassadors/{userId}`
    -   **Objectif** : Stocke le profil complet de l'ambassadeur, avec toutes ses données métier. Créé en même temps que le profil `user`.
    -   **Contient** : `id`, `name`, `email`, `role`, `referralCode`, `level`, `monoyi`, `verificationStatus`, etc.

-   `/ambassadors/{userId}/clientReferrals/{referralId}`
    -   **Objectif** : Sous-collection pour suivre chaque client référé par un ambassadeur.
    -   **Contient** : `clientId`, `referralDate`, `isActive`, `commissionEarned`.

-   `/ambassadors/{userId}/payouts/{payoutId}`
    -   **Objectif** : Sous-collection pour historiser toutes les demandes de retrait de l'ambassadeur.

-   `/ambassadors/{userId}/notifications/{notificationId}`
    -   **Objectif** : Sous-collection pour les notifications personnelles envoyées à un ambassadeur.

-   `/news/{newsId}`
    -   **Objectif** : Collection globale contenant les actualités visibles par tous les ambassadeurs.

-   `/supportMessages/{messageId}`
    -   **Objectif** : Stocke les messages de support envoyés par les utilisateurs via le formulaire de contact.

### 5.3. Règles de Sécurité (`firestore.rules`)
Les règles de sécurité sont le pilier de la protection des données.
-   **`isAdmin()`** : Fonction qui vérifie si l'UID de l'utilisateur authentifié correspond à celui de l'administrateur (fixé dans la règle).
-   **`isUser(userId)`** : Fonction qui vérifie si l'utilisateur authentifié est bien le propriétaire du document qu'il essaie de lire/modifier.
-   **Règles Générales** :
    -   Un utilisateur peut lire et modifier son propre profil `ambassador` et ses sous-collections.
    -   L'administrateur a un accès quasi total (`read`, `write`, `list`) à la plupart des collections pour la gestion.
    -   Les collections publiques comme `news` sont en lecture seule pour tous les utilisateurs authentifiés.
    -   Les opérations de création sont souvent restreintes (ex: seul un admin peut créer une news, seul un utilisateur peut créer un message de support pour lui-même).

### 5.4. Logique Côté Serveur (Server Actions & API)
-   **`src/app/actions.ts`** : Ce fichier est le cœur de la logique backend. Il contient des fonctions asynchrones marquées par `'use server'` qui s'exécutent uniquement sur le serveur.
    -   `signupUser`: Gère toute la logique d'inscription (Auth + Firestore).
    -   `logout`: Supprime le cookie d'authentification.
    -   `updatePromoCode`, `generateAndAssignPromoCode`: Actions réservées à l'admin pour la gestion des codes.
    -   `sendNotificationToAll`, `sendNotificationToUser`: Actions d'envoi de notifications.
    -   `sendSupportMessage`: Enregistre un message de support dans Firestore.

-   **`src/app/api/verify-code/route.ts`** : Il s'agit d'une route API (webhook) destinée à être appelée par l'application principale TTRGESTION.
    -   **Sécurité** : Elle est protégée par une clé API (Bearer Token) qui doit correspondre à `process.env.TTR_API_KEY`.
    -   **Fonctionnalité** : Lorsque l'application principale détecte qu'un client s'est inscrit ou est devenu actif avec un code promo, elle appelle ce webhook. Le webhook met alors à jour le statut du client référé et attribue les points (Monoyi) à l'ambassadeur correspondant dans Firestore.

---

## 6. Variables d'Environnement

Un fichier `.env.local` à la racine est nécessaire avec les variables suivantes :

```
# Clés du projet Firebase (côté client)
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
NEXT_PUBLIC_GA_MEASUREMENT_ID=... # Optionnel

# Email de l'administrateur principal
NEXT_PUBLIC_ADMIN_EMAIL=ttrbuzi@gmail.com

# Clés de service pour le SDK Admin (côté serveur)
FIREBASE_PROJECT_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=... # Doit être formatée correctement (avec les \n)

# Clé API pour le webhook /api/verify-code
TTR_API_KEY=...
```

Ce document devrait fournir une base solide pour comprendre et travailler sur le projet.
