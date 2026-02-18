'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { initializeFirebase } from '@/firebase';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

/**
 * Provides the Firebase context to the client-side of the application.
 * It initializes Firebase using the client-specific configuration.
 */
export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  // Memoize the initialization of Firebase services to prevent re-initialization on re-renders.
  const firebaseServices = useMemo(() => {

    console.log('[FirebaseClientProvider] Init... Env Key present:', !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
    console.log('[FirebaseClientProvider] Key length:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.length);

    // We pass the config explicitly to avoid issues with build-time vs run-time env vars
    const config = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      measurementId: process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID,
    };
    return initializeFirebase(config);
  }, []);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
