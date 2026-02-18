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

    // We pass the config explicitly in HARDCODED string to bypass any Env Var issues
    const config = {
      apiKey: 'AIzaSyCdnxQQiH-7nUfieFVHZnHDQPZkYeay4oE',
      authDomain: 'studio-7043955860-d5b24.firebaseapp.com',
      projectId: 'studio-7043955860-d5b24',
      storageBucket: 'studio-7043955860-d5b24.firebasestorage.app',
      messagingSenderId: '472528856781',
      appId: '1:472528856781:web:6ffe63e547439dcdd12b84',
      measurementId: 'G-REXLH30QKS',
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
