
import 'dotenv/config';
import { initializeApp, cert, getApps, App } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App | undefined = getApps()[0];
let auth: Auth | undefined;
let firestore: Firestore | undefined;

export function getAdminServices() {
  // Si déjà initialisé, retourner les services existants
  if (app) {
    if (!auth) auth = getAuth(app);
    if (!firestore) firestore = getFirestore(app);
    return { app, auth, firestore };
  }

  // --- Diagnostic des variables d'environnement ---
  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId) { console.error('[Firebase Admin] ❌ FIREBASE_PROJECT_ID manquant'); }
  if (!clientEmail) { console.error('[Firebase Admin] ❌ FIREBASE_CLIENT_EMAIL manquant'); }
  if (!rawKey) { console.error('[Firebase Admin] ❌ FIREBASE_PRIVATE_KEY manquant'); }

  if (!projectId || !clientEmail || !rawKey) {
    console.error('[Firebase Admin] ❌ Variables manquantes — initialisation impossible.');
    return { app: undefined, auth: undefined, firestore: undefined };
  }

  // --- Nettoyage de la clé privée ---
  // La clé dans .env.local est entre guillemets et contient des \n littéraux (\\n)
  // On doit : 1) enlever les guillemets, 2) convertir \n littéraux en vrais sauts de ligne
  const privateKey = rawKey
    .replace(/^"([\s\S]*)"$/, '$1') // Enlever les guillemets entourants (multiline safe)
    .replace(/\\n/g, '\n');          // Convertir \n littéraux → vrais sauts de ligne

  // Vérification que la clé a le bon format PEM
  if (!privateKey.includes('-----BEGIN PRIVATE KEY-----')) {
    console.error('[Firebase Admin] ❌ La clé privée ne semble pas être au format PEM valide.');
    console.error('[Firebase Admin] Début de la clé reçue:', privateKey.substring(0, 60));
    return { app: undefined, auth: undefined, firestore: undefined };
  }

  console.log('[Firebase Admin] ✅ Variables OK — tentative d\'initialisation...');

  try {
    app = initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    auth = getAuth(app);
    firestore = getFirestore(app);
    console.log('[Firebase Admin] ✅ Initialisation réussie.');
    return { app, auth, firestore };
  } catch (e: any) {
    console.error('[Firebase Admin] ❌ Erreur d\'initialisation:', e?.message ?? e);
    return { app: undefined, auth: undefined, firestore: undefined };
  }
}
