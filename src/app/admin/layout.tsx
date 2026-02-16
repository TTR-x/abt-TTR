
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
import { UserNav } from '@/components/dashboard/user-nav';
import type { Ambassador } from '@/lib/api';
import React from 'react';
import { useUser, useDoc, useFirestore, useMemoFirebase } from '@/firebase';
import { doc } from 'firebase/firestore';
import { usePathname, useRouter } from 'next/navigation';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import AdminNav from '@/components/admin/admin-nav';
import { Wallet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LoadingLink from '@/components/loading-link';

function AdminSidebar({ user }: { user: Ambassador | null }) {
  return (
    <Sidebar>
      <SidebarHeader>
        <div className="flex items-center gap-2">
          <Icons.logo className="size-7 text-sidebar-primary" />
          <span className="text-lg font-semibold font-headline text-sidebar-foreground">
            Admin
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <AdminNav />
      </SidebarContent>
      <SidebarFooter>
        {user ? (
          <UserNav user={user} />
        ) : (
           <div className="p-2">
             <LoadingIndicator />
           </div>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const pathname = usePathname();

  const ambassadorRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'ambassadors', authUser.uid);
  }, [firestore, authUser]);

  const { data: ambassador, isLoading: isAmbassadorLoading } = useDoc<Ambassador>(ambassadorRef);
  
  React.useEffect(() => {
    if (!isAuthLoading && !authUser) {
      router.push('/login');
      return;
    }
    
    if (!isAuthLoading && authUser && authUser.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      router.push('/dashboard');
    }
  }, [isAuthLoading, authUser, router]);

  const showLoading = isAuthLoading || (authUser && isAmbassadorLoading);

  if (showLoading) {
     return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
            <LoadingIndicator />
        </div>
     );
  }
  
  if (!authUser || authUser.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
    return null; // Redirect is happening via useEffect
  }
  
  const displayAmbassador = ambassador || { id: authUser.uid, name: authUser.displayName || 'Admin', email: authUser.email || '', monoyi: 0, level: 0, referralCode: 'ADMIN', pointsToNextLevel: 0, avatarUrl: '' };


  return (
    <SidebarProvider>
      <AdminSidebar user={ambassador} />
      <SidebarInset>
        <header className="flex h-14 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm lg:h-[60px] lg:px-6 sticky top-0 z-30">
          <SidebarTrigger className="md:hidden" />
          <div className="w-full flex-1"/>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" asChild>
                <LoadingLink href="/dashboard">Retour au Dashboard</LoadingLink>
            </Button>
            <UserNav user={displayAmbassador} />
          </div>
        </header>
        <main className="relative flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
