'use client';

import { getApps, initializeApp } from 'firebase/app';
import { getClientConfig, initializeClientApp } from './client-config';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export * from './provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
export * from './client-provider';


/**
 * Initializes the Firebase client app and returns the SDKs.
 * This is the primary entry point for client-side Firebase access.
 */
export function initializeFirebase(config?: any) {
  if (typeof window === 'undefined') {
    // On the server, we don't initialize the client SDKs.
    return {
      firebaseApp: null,
      auth: null,
      firestore: null,
    };
  }

  let firebaseApp;

  if (config && config.apiKey) {
    if (getApps().length) {
      firebaseApp = getApps()[0];
    } else {
      try {
        firebaseApp = initializeApp(config);
      } catch (error) {
        console.warn("Firebase initialization error, trying getApp:", error);
        if (getApps().length) firebaseApp = getApps()[0];
      }
    }
  } else {
    firebaseApp = initializeClientApp();
  }

  if (!firebaseApp) {
    return {
      firebaseApp: null,
      auth: null,
      firestore: null,
    };
  }

  const auth = getAuth(firebaseApp);
  const firestore = getFirestore(firebaseApp);

  return { firebaseApp, auth, firestore };
}

/**
 * A utility function to get the SDKs from an existing Firebase App instance.
 * @param firebaseApp The initialized Firebase App.
 * @returns The Auth and Firestore SDKs.
 */
export function getSdks(firebaseApp: any) {
  if (!firebaseApp) {
    return {
      firebaseApp: null,
      auth: null,
      firestore: null,
    };
  }
  return {
    firebaseApp,
    auth: getAuth(firebaseApp),
    firestore: getFirestore(firebaseApp),
  };
}
