// This file configures the Firebase client-side SDK.
// It's crucial for connecting the user's browser to your Firebase project.

import { initializeApp, getApps, getApp } from 'firebase/app';

/**
 * Retrieves the client-side Firebase configuration from environment variables.
 * This function is designed to run in the browser and requires environment variables
 * to be prefixed with NEXT_PUBLIC_.
 *
 * @returns The client config object or null if the API key is missing.
 */
export function getClientConfig() {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

  // If the API key is missing, we can't initialize Firebase.
  // Instead of throwing, we'll return null and let the provider handle it.
  if (!apiKey) {
    console.error(
      "Firebase API Key (NEXT_PUBLIC_FIREBASE_API_KEY) is missing. Firebase features will be disabled. Please add it to your .env.local file."
    );
    return null;
  }

  const clientConfig = {
    apiKey: apiKey,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
  };

  // Optional: Warn if other keys are missing but still proceed.
  for (const [key, value] of Object.entries(clientConfig)) {
      if (!value && key !== 'measurementId') { // measurementId is optional
           console.warn(`Firebase config is missing NEXT_PUBLIC_${key.replace(/([A-Z])/g, '_$1').toUpperCase()}. This might cause issues.`);
      }
  }

  return clientConfig;
}

/**
 * Initializes and returns the Firebase app instance for the client.
 * Ensures that the app is only initialized once (singleton pattern).
 * Returns null if the configuration is invalid.
 */
export function initializeClientApp() {
    if (getApps().length) {
        return getApp();
    }
    const config = getClientConfig();
    if (!config) {
        return null;
    }
    return initializeApp(config);
}
