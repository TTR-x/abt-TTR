
'use client';

import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { ReferredClient, Payout } from "@/lib/api";
import EarningsClient from "@/components/dashboard/earnings-client";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { eachMonthOfInterval, subMonths, format, startOfMonth } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function EarningsPage() {
    const { user: authUser, isUserLoading } = useUser();
    const firestore = useFirestore();

    const clientsRef = useMemoFirebase(() => {
        if (!firestore || !authUser) return null;
        return collection(firestore, `ambassadors/${authUser.uid}/clientReferrals`);
    }, [firestore, authUser]);

    const payoutsRef = useMemoFirebase(() => {
        if (!firestore || !authUser) return null;
        return collection(firestore, `ambassadors/${authUser.uid}/payouts`);
    }, [firestore, authUser]);

    const { data: clients, isLoading: isLoadingClients } = useCollection<ReferredClient>(clientsRef);
    const { data: payouts, isLoading: isLoadingPayouts } = useCollection<Payout>(payoutsRef);

    if (isUserLoading || isLoadingClients || isLoadingPayouts) {
        return (
            <div className="flex items-center justify-center h-full">
                <LoadingIndicator />
            </div>
        );
    }
    
    const safeClients = clients || [];
    const safePayouts = payouts || [];

    const totalCommission = safeClients.reduce((acc, client) => acc + client.commissionEarned, 0);

    const pendingPayment = safePayouts
      .filter(p => p.status === 'pending')
      .reduce((sum, p) => sum + p.amount, 0);

    const completedPayouts = safePayouts.filter(p => p.status === 'completed');
    const lastPayment = completedPayouts.length > 0 
      ? completedPayouts.reduce((latest, p) => new Date(p.completionDate!) > new Date(latest.completionDate!) ? p : latest)
      : null;

    // --- Chart Data Logic ---
    const now = new Date();
    const last6Months = eachMonthOfInterval({
      start: subMonths(now, 5),
      end: now,
    });

    const monthlyCommissions: { [key: string]: number } = {};

    safeClients.forEach(client => {
      const referralDate = new Date(client.referralDate);
      const monthYearKey = format(referralDate, 'yyyy-MM');
      if (!monthlyCommissions[monthYearKey]) {
        monthlyCommissions[monthYearKey] = 0;
      }
      monthlyCommissions[monthYearKey] += client.commissionEarned;
    });

    const chartData = last6Months.map(month => {
        const monthYearKey = format(month, 'yyyy-MM');
        const monthName = format(month, 'MMM', { locale: fr });
        return {
            name: monthName.charAt(0).toUpperCase() + monthName.slice(1),
            monoyi: monthlyCommissions[monthYearKey] || 0,
        };
    });
    // --- End Chart Data Logic ---

    const stats = {
        totalCommission,
        pendingPayment,
        lastPayment: lastPayment ? lastPayment.amount : 0,
        lastPaymentDate: lastPayment ? lastPayment.completionDate : null,
    };

  return (
    <EarningsClient stats={stats} chartData={chartData} history={safePayouts} />
  );
}
