
// This type now includes an ID field, which will be the user's UID from Firebase Auth
// and the document ID in the 'ambassadors' collection.
export interface Ambassador {
  id: string; // User UID
  name: string;
  email: string;
  role: 'ambassadeur' | 'partenaire';
  referralCode: string;
  referralLink: string;
  level: number;
  monoyi: number; 
  pointsToNextLevel: number;
  avatarUrl: string;
  isVerified?: boolean;
  lastNewsView?: string; // ISO string timestamp
  verificationStatus?: 'not_verified' | 'pending' | 'verified' | 'rejected';
  createdAt?: string; // ISO string timestamp for registration
}

// Nouvelle entité pour les utilisateurs de base
export interface UserProfile {
  id: string; // User UID
  name: string;
  email: string;
  createdAt: string; // ISO string timestamp
  isAmbassador: boolean; // Pour savoir si un profil ambassadeur a été créé
}

export interface ReferredClient {
  id: string; // Document ID from the subcollection
  clientId: string;
  referralDate: string; // Should be a Firestore Timestamp or ISO string
  isActive: boolean;
  commissionEarned: number; // Reste en points pour le moment, la conversion se fait à l'attribution
  // The following fields might not be in the DB but can be joined/looked up if needed
  name?: string; 
  signupDate?: string;
  status?: 'active' | 'inactive';
  commission?: number;
}

export interface Payout {
  id: string;
  ambassadorId: string;
  amount: number; // Montant en Monoyi
  status: 'pending' | 'completed' | 'failed';
  requestDate: string; // ISO string
  completionDate?: string; // ISO string
  method: 'Visa' | 'Mobile Money';
}

export interface News {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string
  imageUrl?: string;
  imageHint?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string; // ISO string
  isRead: boolean;
  link?: string;
}

export interface SupportMessage {
    id: string;
    userId: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    date: string;
    status: 'new' | 'read' | 'archived';
}

    