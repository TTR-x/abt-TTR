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
    // This function now safely gets the configuration and initializes the app.
    // If the API key is missing, it will throw an error from `getClientConfig`.
    return initializeFirebase();
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
