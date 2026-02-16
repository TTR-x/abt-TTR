# Programme Ambassadeur TTR Gestion

## Introduction

Le programme Ambassadeur TTR Gestion est une plateforme conçue pour permettre à des individus (étudiants, entrepreneurs, professionnels du marketing, etc.) de générer des revenus en promouvant l'application TTRGESTION. En devenant ambassadeur, les utilisateurs obtiennent des outils pour suivre leurs performances et sont récompensés pour chaque nouveau client qu'ils apportent.

## Fonctionnalités Clés

### 1. Inscription et Authentification Sécurisée
- **Processus d'Inscription Simplifié** : Créez un compte en quelques étapes avec une adresse e-mail et un mot de passe.
- **Authentification Robuste** : Connexion sécurisée pour protéger l'accès au tableau de bord de l'ambassadeur.

### 2. Tableau de Bord Personnel (Dashboard)
- **Vue d'Ensemble** : Accès à toutes les statistiques clés en un coup d'œil (points, clients, niveau).
- **Lien de Partage Unique** : Chaque ambassadeur reçoit un lien `https://ttrgestion.com/?ref=CODE` unique à partager.
- **Code Promo Personnalisé** : Un code promo mémorable est généré pour faciliter le partage.
- **Suivi en Temps Réel** : Visualisez les nouveaux clients inscrits et ceux qui deviennent actifs.

### 3. Système de Commission et de Points
- **Gains par Parrainage** : Gagnez des points pour chaque client qui s'abonne à TTRGESTION en utilisant votre code promo.
- **Conversion des Points** : Les points accumulés peuvent être convertis en argent réel.
- **Taux de Conversion** : Un taux fixe (ex: 15 points = 350 FCFA) permet de calculer les gains potentiels.

### 4. Niveaux d'Ambassadeur
- **Progression Motivante** : Évoluez à travers plusieurs niveaux (Niveau 1, 2, 3, etc.) en fonction du nombre de clients actifs que vous référez.
- **Commissions Accrues** : Chaque niveau supérieur débloque un pourcentage de commission plus élevé, récompensant la fidélité et la performance.

### 5. Retrait des Gains (Payouts)
- **Demandes de Retrait Faciles** : Demandez un retrait de vos points directement depuis le tableau de bord, à partir d'un seuil minimum.
- **Plusieurs Méthodes de Paiement** : Choisissez de recevoir vos gains via des méthodes populaires comme le Mobile Money ou par carte Visa.
- **Historique des Transactions** : Consultez un historique complet de toutes vos demandes de retrait (en attente, complétées).

### 6. Vérification du Profil
- **Processus de Confiance** : Un système de vérification d'identité permet de sécuriser la plateforme et de débloquer la fonctionnalité de retrait des gains.
- **Statuts Clairs** : Suivez le statut de votre vérification (non vérifié, en attente, vérifié, rejeté).

### 7. Support et Ressources pour les Ambassadeurs
- **Conseils Stratégiques** : Une section dédiée offre des astuces pour maximiser l'impact et les commissions.
- **Documents et Visuels** : Commandez des visuels marketing personnalisés en utilisant vos points pour promouvoir TTRGESTION efficacement.
- **Centre d'Actualités** : Restez informé des dernières nouvelles et mises à jour du programme.

## Fonctionnement de l'API Externe

Le programme interagit avec l'application principale TTRGESTION via une API sécurisée pour valider les parrainages.

- **Endpoint** : `/api/verify-code`
- **Méthode** : `POST`
- **Sécurité** : La communication est protégée par un secret partagé (`TTR_API_KEY`) via un proxy Cloudflare pour empêcher les appels non autorisés.
- **Actions** :
    1.  Enregistre un `clientUid` comme "inscrit" lorsqu'un utilisateur s'enregistre avec un `promoCode`.
    2.  Met à jour le statut du client à "actif" et attribue des points à l'ambassadeur lorsque le client s'abonne, en se basant sur le `commissionAmount`.
