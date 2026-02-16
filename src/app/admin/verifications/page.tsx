
'use client';

import { useState } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, where, doc, updateDoc } from "firebase/firestore";
import type { Ambassador } from "@/lib/api";
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
import { Check, X, Bell, Send, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { sendNotificationToUser } from "@/app/actions";

export default function AdminVerificationsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [notifyingAmbassador, setNotifyingAmbassador] = useState<Ambassador | null>(null);
  const [notification, setNotification] = useState({ title: '', message: '', link: '' });
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const pendingAmbassadorsRef = useMemoFirebase(() => {
    // Ne construire la requête que si Firestore est disponible
    if (!firestore) return null;
    return query(collection(firestore, 'ambassadors'), where('verificationStatus', '==', 'pending'));
  }, [firestore]);

  const { data: ambassadors, isLoading } = useCollection<Ambassador>(pendingAmbassadorsRef);

  const resetNotificationDialog = () => {
      setNotifyingAmbassador(null);
      setNotification({ title: '', message: '', link: '' });
      setDialogError(null);
  }

  const handleVerificationAction = async (ambassador: Ambassador, newStatus: 'verified' | 'rejected') => {
    if (!firestore) return;

    setLoadingAction(ambassador.id);
    try {
      const ambassadorDocRef = doc(firestore, 'ambassadors', ambassador.id);
      await updateDoc(ambassadorDocRef, {
        verificationStatus: newStatus,
        isVerified: newStatus === 'verified'
      });
      toast({
        title: "Statut mis à jour",
        description: `L'ambassadeur a été ${newStatus === 'verified' ? 'approuvé' : 'rejeté'}.`,
      });
      
      // Auto-open notification dialog after action
      setNotifyingAmbassador(ambassador);
      setNotification({
        title: newStatus === 'verified' ? 'Votre profil a été vérifié !' : 'Action requise sur votre profil',
        message: newStatus === 'verified' ? 'Félicitations ! Votre profil est maintenant vérifié. Vous pouvez désormais demander des retraits de vos gains.' : 'Votre demande de vérification a été rejetée. Veuillez vérifier vos informations et soumettre à nouveau.',
        link: newStatus === 'verified' ? '/dashboard/earnings' : '/dashboard/verify'
      });

    } catch (error) {
      console.error(error);
      toast({ variant: 'destructive', title: "Erreur", description: "La mise à jour a échoué." });
    } finally {
      setLoadingAction(null);
    }
  };

  const formatDate = (dateString: any) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };
  
  const handleSendNotification = async () => {
    if (!notifyingAmbassador || !notification.title || !notification.message) {
      setDialogError("Le titre et le message sont obligatoires.");
      return;
    }
    setIsSubmitting(true);
    setDialogError(null);
    try {
      const result = await sendNotificationToUser(notifyingAmbassador.id, notification.title, notification.message, notification.link);
      if (result.error) throw new Error(result.error);
      
      toast({
        title: "Notification envoyée !",
        description: `La notification a été envoyée à ${notifyingAmbassador.name}.`
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


  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Demandes de Vérification</h1>
          <p className="text-muted-foreground">
            Validez les informations des ambassadeurs pour vérifier leurs comptes.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Demandes en Attente</CardTitle>
            <CardDescription>
              {isLoading ? 'Chargement...' : `${ambassadors?.length || 0} demandes en attente.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ambassadeur</TableHead>
                  <TableHead>Informations</TableHead>
                  <TableHead>Date de Soumission</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-10 w-48" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-36 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : ambassadors && ambassadors.length > 0 ? (
                  ambassadors.map((ambassador) => (
                    <TableRow key={ambassador.id}>
                      <TableCell>
                        <div className="font-medium">{ambassador.name}</div>
                        <div className="text-xs text-muted-foreground">{ambassador.email}</div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm">
                          <p><strong>Ville:</strong> {(ambassador as any).verificationInfo?.city}</p>
                          <p><strong>Quartier:</strong> {(ambassador as any).verificationInfo?.neighborhood}</p>
                          <p><strong>Fonction:</strong> {(ambassador as any).verificationInfo?.jobFunction}</p>
                          <p><strong>WhatsApp:</strong> {(ambassador as any).verificationInfo?.whatsappNumber}</p>
                          <a href={(ambassador as any).verificationInfo?.geolocationLink} target="_blank" rel="noopener noreferrer" className="text-primary underline">
                            Voir localisation
                          </a>
                        </div>
                      </TableCell>
                      <TableCell>{formatDate((ambassador as any).verificationInfo?.submissionDate)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleVerificationAction(ambassador, 'verified')}
                            disabled={loadingAction === ambassador.id}
                          >
                            <Check className="mr-2 h-4 w-4" /> Approuver
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => handleVerificationAction(ambassador, 'rejected')}
                            disabled={loadingAction === ambassador.id}
                          >
                            <X className="mr-2 h-4 w-4" /> Rejeter
                          </Button>
                           <Button variant="outline" size="icon" className="h-9 w-9" onClick={() => setNotifyingAmbassador(ambassador)}>
                                <Bell className="h-4 w-4" />
                            </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center">
                          Aucune demande de vérification en attente.
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
              Envoyer une notification ciblée à {notifyingAmbassador?.name}.
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

    