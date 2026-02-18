

'use client';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarFooter,
  SidebarProvider,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { Icons } from '@/components/icons';
import { MainNav } from '@/components/dashboard/main-nav';
import { UserNav } from '@/components/dashboard/user-nav';
import type { Ambassador, Payout, UserProfile } from '@/lib/api';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserCheck, Wallet, ArrowRight, Clock, CheckCircle, Info, Ticket } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc, collection, addDoc, serverTimestamp, where, query } from 'firebase/firestore';
import { usePathname, useRouter } from 'next/navigation';
import { PayoutDialog } from '@/components/dashboard/payout-dialog';
import LoadingLink from '@/components/loading-link';
import { NotificationBell } from '@/components/dashboard/notification-bell';
import CompleteRegistrationPage from './complete-registration/page';

function OnboardingStatus({ user }: { user: Ambassador | null }) {

  if (!user) {
    // If there is no ambassador profile, it means they are a new user.
    return (
      <div className="flex flex-col gap-2 rounded-md border border-sidebar-border bg-sidebar-accent p-2 text-sm text-sidebar-accent-foreground">
        <div className="font-semibold">Activation en attente</div>
        <div className="text-xs">
          Votre profil ambassadeur sera bientôt activé par un administrateur.
        </div>
      </div>
    );
  }

  const hasCode = !!user.referralCode;
  const verificationStatus = user.verificationStatus;

  // This should not happen now, but as a fallback
  if (!hasCode) {
    return (
      <div className="flex flex-col gap-2 rounded-md border border-sidebar-border bg-sidebar-accent p-2 text-sm text-sidebar-accent-foreground">
        <div className="font-semibold">Code en attente</div>
        <div className="text-xs">
          Votre code promo sera affiché ici dans 48h au plus.
        </div>
      </div>
    );
  }

  // Step 2: Verify profile (if code exists but profile is not verified)
  if (verificationStatus !== 'verified') {
    if (verificationStatus === 'pending') {
      return (
        <div className="flex items-center gap-2 rounded-md border border-yellow-200 bg-yellow-50 p-2 text-sm text-yellow-800 dark:border-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300">
          <Clock className="mr-2 size-4 text-yellow-600" />
          <div>
            <div className="font-semibold">Vérification en cours</div>
            <div className="text-xs">Cela peut prendre jusqu'à 3 jours.</div>
          </div>
        </div>
      );
    }
    return (
      <div className="flex flex-col gap-2 rounded-md border border-sidebar-border bg-sidebar-accent p-2 text-sm text-sidebar-accent-foreground">
        <div className="font-semibold">Vérifiez votre identité</div>
        <div className="text-xs">
          Vérifiez votre profil pour pouvoir retirer vos gains.
        </div>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-7 w-full bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90 hover:text-sidebar-primary-foreground"
        >
          <LoadingLink href="/dashboard/verify">
            <UserCheck className="mr-2 size-3" />
            Vérifier
          </LoadingLink>
        </Button>
      </div>
    );
  }

  // All steps completed
  return (
    <div className="flex items-center gap-2 rounded-md border border-green-200 bg-green-50 p-2 text-sm text-green-800 dark:border-green-800 dark:bg-green-900/30 dark:text-green-300">
      <CheckCircle className="mr-2 size-4 text-green-600" />
      <div>
        <div className="font-semibold">Profil Complet</div>
        <div className="text-xs">Vous êtes prêt à réussir !</div>
      </div>
    </div>
  );
}


function AppSidebar({ user }: { user: Ambassador | null }) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Icons.logo className="size-7 text-sidebar-primary" />
          <span className="text-lg font-semibold font-headline text-sidebar-foreground">
            Ambassadeur
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <MainNav />
      </SidebarContent>
      <SidebarFooter>
        <OnboardingStatus user={user} />
        {user ? (
          <UserNav user={user} />
        ) : (
          <div className="flex items-center gap-2 p-2">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-3 w-32" />
            </div>
          </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

function DashboardContent({ children }: { children: React.ReactNode }) {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'users', authUser.uid);
  }, [firestore, authUser]);

  const ambassadorDocRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'ambassadors', authUser.uid);
  }, [firestore, authUser]);

  const { data: userProfile, isLoading: isUserProfileLoading } = useDoc<UserProfile>(userDocRef);
  const { data: ambassadorProfile, isLoading: isAmbassadorLoading } = useDoc<Ambassador>(ambassadorDocRef);

  const needsToCompleteRegistration = authUser && userProfile && !(ambassadorProfile as any)?.country;

  useEffect(() => {
    if (isAuthLoading || (authUser && (isUserProfileLoading || isAmbassadorLoading))) {
      return;
    }

    if (!authUser && firestore) {
      router.push('/login');
      return;
    }

    const isAdmin = authUser?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;
    if (isAdmin) {
      return;
    }

  }, [isAuthLoading, isUserProfileLoading, isAmbassadorLoading, authUser, userProfile, ambassadorProfile, router, firestore]);


  const isLoading = isAuthLoading || (authUser && (isUserProfileLoading || isAmbassadorLoading));

  if (isLoading) {
    return (
      <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <LoadingIndicator />
      </div>
    );
  }

  if (needsToCompleteRegistration) {
    return <CompleteRegistrationPage authUser={authUser} />;
  }

  const displayUser = ambassadorProfile || userProfile || {
    id: authUser?.uid || '',
    name: authUser?.displayName || 'Utilisateur',
    email: authUser?.email || '',
    monoyi: 0,
    level: 0,
    referralCode: ''
  };

  return (
    <SidebarProvider>
      <AppSidebar user={ambassadorProfile} />
      <SidebarInset className="min-w-0 overflow-hidden">
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm lg:h-[60px] lg:px-6 sticky top-0 z-30">
          <SidebarTrigger className="md:hidden" />
          <div className="w-full flex-1" />
          <div className="flex items-center gap-4">
            <NotificationBell />
            <PayoutDialog ambassador={ambassadorProfile} />
            <UserNav user={displayUser as Ambassador} variant="header" />
          </div>
        </header>
        <main className="relative flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6 min-w-0 overflow-hidden">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Les pages de connexion et d'inscription ont leur propre layout
  if (pathname === '/login') {
    return <>{children}</>;
  }

  // Le layout admin est séparé
  if (pathname.startsWith('/admin')) {
    return <>{children}</>;
  }

  return (
    <DashboardContent>{children}</DashboardContent>
  );
}
