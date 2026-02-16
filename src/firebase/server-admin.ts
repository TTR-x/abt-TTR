
import 'dotenv/config';
import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App | undefined = getApps()[0];
let auth: Auth | undefined;
let firestore: Firestore | undefined;

/**
 * Initializes and returns Firebase Admin services (Auth, Firestore).
 * Ensures that the app is only initialized once (singleton pattern).
 * Returns null if configuration is invalid.
 */
export function getAdminServices() {
  if (app) {
    if (!auth) auth = getAuth(app);
    if (!firestore) firestore = getFirestore(app);
    return { app, auth, firestore };
  }

  const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

  if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && privateKey) {
    try {
      app = initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      });
      auth = getAuth(app);
      firestore = getFirestore(app);
      return { app, auth, firestore };
    } catch (e) {
      console.error('Firebase Admin initialization error:', e);
      return { app: undefined, auth: undefined, firestore: undefined };
    }
  }

  console.warn("Firebase Admin environment variables are not fully set. Admin services will be disabled.");
  return { app: undefined, auth: undefined, firestore: undefined };
}
