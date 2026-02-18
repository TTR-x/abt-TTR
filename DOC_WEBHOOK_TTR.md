# Documentation d'Intégration API - Webhook TTR Gestion vers ABT

Ce document décrit comment l'application **TTR Gestion** doit communiquer avec le programme Ambassadeur (ABT) pour notifier les événements importants : **Inscription d'un client** par parrainage et **Paiement d'un client** (abonnement).

---

## 🔒 Authentification

Toutes les requêtes vers l'API ABT doivent inclure une clé de sécurité dans les en-têtes HTTP.

- **Header Name** : `x-api-key`
- **Header Value** : `TTRABTogbsqknlkszfv5GNGDkvfdcbvnnh4865365893`

---

## 📡 Endpoint Principal

**URL de base** : `https://ton-domaine-abt.vercel.app` (à remplacer par l'URL de production réelle)

| Méthode | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/webhooks/ttr` | Point d'entrée unique pour tous les événements |

---

## 📦 Structure du Payload (JSON)

Le corps de la requête doit être un objet JSON valide contenant les champs suivants :

### Champs Communs (Obligatoires)

| Champ | Type | Description |
| :--- | :--- | :--- |
| `eventType` | `string` | Le type d'événement. Valeurs acceptées : `'CLIENT_SIGNUP'`, `'SUBSCRIPTION_PAYMENT'` |
| `ambassadorId` | `string` | **Le Code Promo** de l'ambassadeur (ex: `JEAN1234`). C'est l'identifiant unique utilisé pour lier le client. |
| `clientName` | `string` | Le nom complet du client (entreprise ou personne). |
| `clientEmail` | `string` | L'email du client (pour unicité et notifications). |
| `amount` | `number` | Le montant de la transaction en **FCFA**. (Mettre `0` pour une simple inscription). |

---

## 📝 Scénarios d'Utilisation

### 1. Inscription d'un nouveau client (via Code Promo)

Appelé lorsque le client s'inscrit sur TTR Gestion en utilisant le code parrainage.
Cet événement **crée le lien** entre le client et l'ambassadeur dans la base ABT.

**Payload :**
```json
{
  "eventType": "CLIENT_SIGNUP",
  "ambassadorId": "JEAN8529",  // Le code promo saisi par le client
  "clientName": "Boulangerie Le Bon Pain",
  "clientEmail": "contact@lebonpain.lom",
  "amount": 0 // Pas de paiement à l'inscription
}
```

**Effet :**
- L'ambassadeur reçoit une notification.
- L'ambassadeur gagne **10 points** (ou selon la règle en vigueur).
- Le client apparaît dans son tableau de bord avec le statut "Inactif".

---

### 2. Paiement d'un abonnement (Commission)

Appelé lorsque le client effectue un paiement (initial ou renouvellement) sur TTR Gestion.

**Payload :**
```json
{
  "eventType": "SUBSCRIPTION_PAYMENT",
  "ambassadorId": "JEAN8529", // Toujours le même code promo
  "clientName": "Boulangerie Le Bon Pain",
  "clientEmail": "contact@lebonpain.lom",
  "amount": 15000 // Montant payé par le client en FCFA
}
```

**Effet :**
- L'API calcule automatiquement la commission (ex: 20% = 3000 FCFA).
- Convertit le montant en **Monoyi** (1 MYI = 800 FCFA).
- Crédite le solde de l'ambassadeur.
- Ajoute une transaction dans l'historique des gains.
- Envoie une notification de gain ("Félicitations, vous avez gagné...").

---

## 🔄 Réponses de l'API

L'API renverra toujours un statut HTTP et un message JSON.

| Code HTTP | Signification | Cause possible |
| :--- | :--- | :--- |
| **200 OK** | Succès | L'événement a été traité et enregistré. |
| **400 Bad Request** | Erreur Client | Données manquantes (ex: pas d'email), `eventType` inconnu. |
| **401 Unauthorized** | Non Autorisé | Clé API manquante ou incorrecte. |
| **404 Not Found** | Introuvable | Le code promo (`ambassadorId`) n'existe pas dans la base ABT. |
| **500 Server Error** | Erreur Serveur | Problème interne (base de données, etc.). |

### Exemple de réponse succès :
```json
{
  "success": true,
  "monoyiEarned": 3.75, // Si commission
  "message": "Commission enregistrée avec succès."
}
```

### Exemple de réponse erreur :
```json
{
  "success": false,
  "error": "Code promo invalide ou ambassadeur introuvable."
}
```

---

## 💻 Exemple d'implémentation (JavaScript / Node.js)

```javascript
async function notifyAmbassadorProgram(eventData) {
  const S_API_KEY = 'TTRABTogbsqknlkszfv5GNGDkvfdcbvnnh4865365893';
  const ABT_URL = 'https://ton-domaine.vercel.app/api/webhooks/ttr';

  try {
    const response = await fetch(ABT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': S_API_KEY
      },
      body: JSON.stringify(eventData)
    });

    const result = await response.json();
    
    if (!response.ok) {
      console.error('Erreur Webhook ABT:', result.error);
    } else {
      console.log('Succès Webhook ABT:', result.message);
    }
  } catch (error) {
    console.error('Erreur réseau Webhook ABT:', error);
  }
}

// Utilisation
notifyAmbassadorProgram({
  eventType: 'SUBSCRIPTION_PAYMENT',
  ambassadorId: 'CODE123',
  clientName: 'Client Test',
  clientEmail: 'test@client.com',
  amount: 5000
});
```
