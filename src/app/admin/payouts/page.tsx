
'use client';

import { useState } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collectionGroup, query, collection, doc, runTransaction, increment } from "firebase/firestore";
import type { Payout, Ambassador } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheckCircle, Clock, Loader2, Bell, Send } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendNotificationToUser } from "@/app/actions";

interface PayoutWithAmbassador extends Payout {
  ambassadorName?: string;
  ambassadorEmail?: string;
}

export default function AdminPayoutsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [notifyingAmbassador, setNotifyingAmbassador] = useState<PayoutWithAmbassador | null>(null);
  const [notification, setNotification] = useState({ title: '', message: '', link: '' });
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const payoutsRef = useMemoFirebase(() => {
    // Ne construire la requête que si Firestore est disponible
    if (!firestore) return null;
    return query(collectionGroup(firestore, 'payouts'));
  }, [firestore]);

  const ambassadorsRef = useMemoFirebase(() => {
    // Ne construire la requête que si Firestore est disponible
    if (!firestore) return null;
    return collection(firestore, 'ambassadors');
  }, [firestore]);

  const { data: payouts, isLoading: isLoadingPayouts } = useCollection<Payout>(payoutsRef);
  const { data: ambassadors, isLoading: isLoadingAmbassadors } = useCollection<Ambassador>(ambassadorsRef);

  const resetNotificationDialog = () => {
      setNotifyingAmbassador(null);
      setNotification({ title: '', message: '', link: '' });
      setDialogError(null);
  }
  
  const handleApprove = async (payout: PayoutWithAmbassador) => {
    if (!firestore) {
        toast({ variant: "destructive", title: "Erreur", description: "Service Firestore non disponible." });
        return;
    }
    setLoadingAction(payout.id);
    try {
        await runTransaction(firestore, async (transaction) => {
            const ambassadorDocRef = doc(firestore, 'ambassadors', payout.ambassadorId);
            const payoutDocRef = doc(firestore, 'ambassadors', payout.ambassadorId, 'payouts', payout.id);
            
            const ambassadorDoc = await transaction.get(ambassadorDocRef);
            if (!ambassadorDoc.exists() || ambassadorDoc.data().monoyi < payout.amount) {
                throw new Error("Solde Monoyi insuffisant ou ambassadeur introuvable.");
            }
            
            // 1. Mettre à jour l'ambassadeur en déduisant les monoyi
            transaction.update(ambassadorDocRef, {
                monoyi: increment(-payout.amount)
            });
            
            // 2. Mettre à jour la demande de retrait
            transaction.update(payoutDocRef, {
                status: 'completed',
                completionDate: new Date().toISOString()
            });
        });
        
        toast({
            title: "Approbation réussie !",
            description: `${payout.amount} Monoyi ont été déduits de ${payout.ambassadorName}.`,
        });

        // Auto-open notification dialog
        setNotifyingAmbassador(payout);
        setNotification({
          title: "Votre demande de retrait a été traitée",
          message: `Votre demande de retrait de ${payout.amount} Monoyi a été approuvée et traitée. L'argent a été envoyé.`,
          link: '/dashboard/earnings'
        });

    } catch (error) {
        console.error("Erreur lors de l'approbation du retrait:", error);
        const errorMessage = error instanceof Error ? error.message : "Une erreur inconnue est survenue.";
        toast({
            variant: "destructive",
            title: "L'approbation a échoué",
            description: errorMessage,
        });
    } finally {
        setLoadingAction(null);
    }
  };

  const handleSendNotification = async () => {
    if (!notifyingAmbassador || !notification.title || !notification.message) {
      setDialogError("Le titre et le message sont obligatoires.");
      return;
    }
    setIsSubmitting(true);
    setDialogError(null);
    try {
      const result = await sendNotificationToUser(notifyingAmbassador.ambassadorId, notification.title, notification.message, notification.link);
      if (result.error) throw new Error(result.error);
      
      toast({
        title: "Notification envoyée !",
        description: `La notification a été envoyée à ${notifyingAmbassador.ambassadorName}.`
      });
      resetNotificationDialog();
    } catch (error: any) {
      console.error(error);
      setDialogError(error.message);
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };


  const isLoading = isLoadingPayouts || isLoadingAmbassadors;

  // Créer une map pour une recherche rapide des ambassadeurs
  const ambassadorMap = new Map(ambassadors?.map(a => [a.id, a]));

  const enrichedPayouts: PayoutWithAmbassador[] = (payouts || []).map(p => ({
    ...p,
    ambassadorName: ambassadorMap.get(p.ambassadorId)?.name || 'Inconnu',
    ambassadorEmail: ambassadorMap.get(p.ambassadorId)?.email || 'N/A',
  })).sort((a, b) => new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime());

  const formatDate = (dateString?: string) => {
      if (!dateString) return "N/A";
      return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  }
  const formatCurrency = (amount: number) => amount.toLocaleString('fr-FR') + " MYI";

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Demandes de Retrait</h1>
          <p className="text-muted-foreground">
            Gérez et approuvez les demandes de paiement des ambassadeurs.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Toutes les Demandes</CardTitle>
            <CardDescription>
              {isLoading ? 'Chargement...' : `${enrichedPayouts?.length || 0} demandes au total.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ambassadeur</TableHead>
                  <TableHead>Montant (Monoyi)</TableHead>
                  <TableHead>Méthode</TableHead>
                  <TableHead>Date de demande</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : enrichedPayouts.length > 0 ? (
                  enrichedPayouts.map((payout) => (
                    <TableRow key={payout.id}>
                      <TableCell>
                        <div className="font-medium">{payout.ambassadorName}</div>
                        <div className="text-xs text-muted-foreground">{payout.ambassadorEmail}</div>
                      </TableCell>
                      <TableCell>{formatCurrency(payout.amount)}</TableCell>
                      <TableCell>{payout.method}</TableCell>
                      <TableCell>{formatDate(payout.requestDate)}</TableCell>
                      <TableCell>
                        <Badge variant={payout.status === 'completed' ? 'default' : 'secondary'} className={
                          payout.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 
                          payout.status === 'completed' ? 'bg-green-100 text-green-800' : ''
                        }>
                          {payout.status === 'pending' && <Clock className="mr-1 h-3 w-3" />}
                          {payout.status === 'completed' && <CheckCircle className="mr-1 h-3 w-3" />}
                          {payout.status === 'pending' ? "En attente" : payout.status === 'completed' ? "Complété" : "Échoué"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {payout.status === 'pending' && (
                            <Button 
                                variant="outline" 
                                size="sm" 
                                onClick={() => handleApprove(payout)}
                                disabled={loadingAction === payout.id}
                            >
                              {loadingAction === payout.id ? <Loader2 className="animate-spin" /> : "Approuver"}
                            </Button>
                          )}
                           <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setNotifyingAmbassador(payout)}>
                              <Bell className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                      <TableCell colSpan={6} className="h-24 text-center">
                          Aucune demande de retrait pour le moment.
                      </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
      
       {/* Dialog for sending a notification */}
      <Dialog open={!!notifyingAmbassador} onOpenChange={(open) => !open && resetNotificationDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer une notification</DialogTitle>
            <DialogDescription>
              Envoyer une notification ciblée à {notifyingAmbassador?.ambassadorName}.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
                <Label htmlFor="notifTitle">Titre</Label>
                <Input
                    id="notifTitle"
                    value={notification.title}
                    onChange={(e) => setNotification({ ...notification, title: e.target.value })}
                    placeholder="Titre de la notification"
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="notifMessage">Message</Label>
                <Textarea
                    id="notifMessage"
                    value={notification.message}
                    onChange={(e) => setNotification({ ...notification, message: e.target.value })}
                    placeholder="Contenu de la notification..."
                />
            </div>
            <div className="space-y-2">
                <Label htmlFor="notifLink">Lien (Optionnel)</Label>
                <Input
                    id="notifLink"
                    value={notification.link}
                    onChange={(e) => setNotification({ ...notification, link: e.target.value })}
                    placeholder="/dashboard/news"
                />
            </div>
            {dialogError && (
                <Alert variant="destructive">
                    <AlertDescription>{dialogError}</AlertDescription>
                </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={resetNotificationDialog}>Annuler</Button>
            <Button onClick={handleSendNotification} disabled={isSubmitting || !notification.title || !notification.message}>
                {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Send className="mr-2 h-4 w-4" />}
                Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

    