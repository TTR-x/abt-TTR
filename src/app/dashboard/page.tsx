
'use client';

import DashboardClient from '@/components/dashboard/dashboard-client'
import type { Ambassador, ReferredClient } from '@/lib/api'
import { useUser, useCollection, useFirestore, useMemoFirebase, useDoc } from '@/firebase';
import { collection, doc } from 'firebase/firestore';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';


// The ambassador prop is passed down from the layout
export default function DashboardPage() {
  const firestore = useFirestore();
  const { user: authUser, isUserLoading: isAuthLoading } = useUser();

  const ambassadorRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'ambassadors', authUser.uid);
  }, [firestore, authUser]);

  const { data: ambassador, isLoading: isLoadingAmbassador } = useDoc<Ambassador>(ambassadorRef);

  const clientsRef = useMemoFirebase(() => {
    // We can already define the ref even if ambassador is not loaded, using authUser.uid
    if (!firestore || !authUser) return null;
    return collection(firestore, `ambassadors/${authUser.uid}/clientReferrals`);
  }, [firestore, authUser]);

  const { data: clients, isLoading: isLoadingClients } = useCollection<ReferredClient>(clientsRef);

  // The primary loading condition should be the authentication check
  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingIndicator />
      </div>
    );
  }

  // If after auth loading, we still don't have an authenticated user, something is wrong.
  // The layout should handle redirection, but as a fallback:
  if (!authUser) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Utilisateur non authentifié. Redirection...</p>
      </div>
    );
  }

  // If ambassador is still loading, show a specific loader.
  if (isLoadingAmbassador || isLoadingClients) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingIndicator />
        <p className="ml-4">Chargement du profil...</p>
      </div>
    );
  }

  // If we have an authenticated user, but no ambassador document, we can show a default state
  const finalAmbassador = ambassador || {
    id: authUser.uid,
    name: authUser.displayName || 'Nouvel Ambassadeur',
    email: authUser.email || '',
    referralCode: '',
    level: 1,
    monoyi: 0, // Remplacé "points" par "monoyi"
    pointsToNextLevel: 10,
    avatarUrl: '',
  };

  const safeClients = clients || [];

  // --- Dynamic Stats Calculation ---
  const now = new Date();
  const startOfCurrentMonth = startOfMonth(now);
  const endOfCurrentMonth = endOfMonth(now);
  const startOfLastMonth = startOfMonth(subMonths(now, 1));
  const endOfLastMonth = endOfMonth(subMonths(now, 1));

  const pointsThisMonth = safeClients
    .filter(client => {
      const referralDate = new Date(client.referralDate);
      return isWithinInterval(referralDate, { start: startOfCurrentMonth, end: endOfCurrentMonth });
    })
    .reduce((sum, client) => sum + client.commissionEarned, 0);

  const clientsThisMonth = safeClients.filter(c => isWithinInterval(new Date(c.referralDate), { start: startOfCurrentMonth, end: endOfCurrentMonth }));
  const activeClientsThisMonth = clientsThisMonth.filter(c => c.isActive).length;
  const conversionRateThisMonth = clientsThisMonth.length > 0 ? (activeClientsThisMonth / clientsThisMonth.length) * 100 : 0;

  const clientsLastMonth = safeClients.filter(c => isWithinInterval(new Date(c.referralDate), { start: startOfLastMonth, end: endOfLastMonth }));
  const activeClientsLastMonth = clientsLastMonth.filter(c => c.isActive).length;
  const conversionRateLastMonth = clientsLastMonth.length > 0 ? (activeClientsLastMonth / clientsLastMonth.length) * 100 : 0;

  const conversionRateDiff = conversionRateThisMonth - conversionRateLastMonth;

  const stats = {
    totalCommission: safeClients.reduce((acc, client) => acc + client.commissionEarned, 0),
    totalClients: safeClients.length,
    activeClients: safeClients.filter(client => client.isActive).length,
    pendingClients: safeClients.filter(client => !client.isActive).length,
    pendingMonoyi: safeClients.filter(client => !client.isActive).length * 10, // 10 MYI per pending signup
    pointsThisMonth,
    conversionRateDiff,
  };
  const conversionRate = stats.totalClients > 0 ? (stats.activeClients / stats.totalClients) * 100 : 0;

  // Manually add mock properties to clients for display purposes for now
  const displayClients = safeClients.map(c => ({
    ...c,
    name: `Client ${c.clientId.substring(0, 4)}`,
    signupDate: new Date(c.referralDate).toLocaleDateString('fr-FR'),
    status: c.isActive ? 'active' : 'inactive',
    commission: c.commissionEarned,
  }))


  return <DashboardClient ambassador={finalAmbassador} clients={displayClients} stats={stats} conversionRate={conversionRate} />
}
