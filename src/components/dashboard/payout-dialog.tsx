'use client';

import { useState } from 'react';
import { useFirestore } from '@/firebase';
import { collection, addDoc } from 'firebase/firestore';
import type { Ambassador, Payout } from '@/lib/api';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import LoadingLink from '@/components/loading-link';
import { Info, UserCheck } from 'lucide-react';
import { MonoyiIcon } from '@/components/icons/monoyi-icon';
import { LoadingIndicator } from '@/components/ui/loading-indicator';

export function PayoutDialog({ ambassador }: { ambassador: Ambassador | null }) {
    const [open, setOpen] = useState(false);
    const [amount, setAmount] = useState(0);
    const [error, setError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const firestore = useFirestore();

    if (!ambassador) {
      return (
         <button
          className="flex items-center gap-2 rounded-full border bg-secondary px-3 py-1 text-sm disabled:cursor-not-allowed disabled:opacity-50"
          disabled
        >
            <MonoyiIcon className="h-4 w-4 text-primary" />
        </button>
      )
    }

    const minPayout = 5;
    const monoyiAvailable = typeof ambassador.monoyi === 'number';
    const isVerified = ambassador.verificationStatus === 'verified';

    const handleRequestPayout = async () => {
        setError('');
        if (!isVerified) {
             setError("Vous devez vérifier votre profil avant de pouvoir demander un retrait.");
             return;
        }
        if (amount < minPayout) {
            setError(`Le montant minimum pour un retrait est de ${minPayout} Monoyi.`);
            return;
        }
        if (amount > ambassador.monoyi) {
            setError("Vous n'avez pas assez de Monoyi pour ce retrait.");
            return;
        }

        setIsSubmitting(true);
        try {
            if (!firestore || !ambassador.id) throw new Error("Firestore not available");
            const payoutsRef = collection(firestore, `ambassadors/${ambassador.id}/payouts`);

            await addDoc(payoutsRef, {
                amount: Number(amount),
                ambassadorId: ambassador.id,
                status: 'pending',
                requestDate: new Date().toISOString(),
                method: (ambassador as any).payoutMethod || 'Mobile Money' // Default or from ambassador data
            } as Omit<Payout, 'id'>);

            toast({
                title: "Demande de retrait envoyée",
                description: `Votre demande de ${amount} Monoyi a été envoyée pour approbation.`,
            });
            setOpen(false);
            setAmount(0);
        } catch (err) {
            console.error(err);
            setError("Une erreur est survenue lors de l'envoi de votre demande.");
            toast({
                variant: 'destructive',
                title: "Erreur",
                description: "Impossible de soumettre votre demande de retrait.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const triggerButton = (
         <button className="flex items-center gap-2 rounded-full border bg-secondary px-3 py-1 text-sm hover:bg-muted transition-colors disabled:cursor-not-allowed disabled:opacity-50">
            <MonoyiIcon className="h-4 w-4 text-primary" />
            <span className="font-semibold">{monoyiAvailable ? ambassador.monoyi : '...'}</span>
            <span className="text-muted-foreground">Monoyi</span>
        </button>
    );

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {triggerButton}
            </DialogTrigger>

            {isVerified ? (
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Demander un retrait de Monoyi</DialogTitle>
                        <DialogDescription>
                            Convertissez vos Monoyi en argent. 1 Monoyi = 800 FCFA. Retrait minimum: {minPayout} Monoyi.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label htmlFor="amount">Montant à retirer (en Monoyi)</Label>
                            <Input
                                id="amount"
                                type="number"
                                value={amount}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                placeholder={`Ex: ${minPayout}`}
                                max={ambassador.monoyi}
                                min={minPayout}
                            />
                            <p className="text-sm text-muted-foreground">
                                Solde actuel : <span className="font-bold text-primary">{ambassador.monoyi} Monoyi</span>
                            </p>
                        </div>
                        {error && (
                            <Alert variant="destructive">
                                <AlertDescription>{error}</AlertDescription>
                            </Alert>
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                        <Button onClick={handleRequestPayout} disabled={isSubmitting || amount < minPayout || !monoyiAvailable}>
                            {isSubmitting ? <LoadingIndicator className="h-5 w-5" /> : `Demander ${amount} Monoyi`}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            ) : (
                 <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Vérification requise</DialogTitle>
                        <DialogDescription>
                            Pour pouvoir retirer vos gains, vous devez d'abord faire vérifier votre profil.
                        </DialogDescription>
                    </DialogHeader>
                     <Alert>
                        <Info className="h-4 w-4"/>
                        <AlertTitle>Pourquoi est-ce nécessaire ?</AlertTitle>
                        <AlertDescription>
                          La vérification nous aide à confirmer votre identité, à sécuriser la plateforme et à nous conformer aux réglementations financières.
                        </AlertDescription>
                    </Alert>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setOpen(false)}>Plus tard</Button>
                        <Button asChild>
                           <LoadingLink href="/dashboard/verify" onClick={() => setOpen(false)}>
                                <UserCheck className="mr-2"/>
                                Commencer la vérification
                           </LoadingLink>
                        </Button>
                    </DialogFooter>
                </DialogContent>
            )}
        </Dialog>
    );
}
