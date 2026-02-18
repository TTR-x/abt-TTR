
'use client';

import { useState, useMemo } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, doc, updateDoc, increment, runTransaction } from "firebase/firestore";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Search, Crown, Pencil, Bell, Sparkles } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { MonoyiIcon } from "@/components/icons/monoyi-icon";
import { updatePromoCode, sendNotificationToUser, generateAndAssignPromoCode } from "@/app/actions";
import { Textarea } from "@/components/ui/textarea";
import { Eye, DollarSign, Users as UsersIcon, Activity } from "lucide-react";
import { differenceInYears, parseISO } from "date-fns";

export default function AdminAmbassadorsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [selectedAmbassador, setSelectedAmbassador] = useState<Ambassador | null>(null);
  const [editingAmbassador, setEditingAmbassador] = useState<Ambassador | null>(null);
  const [notifyingAmbassador, setNotifyingAmbassador] = useState<Ambassador | null>(null);
  const [viewingAmbassador, setViewingAmbassador] = useState<Ambassador | null>(null);
  const [newPromoCode, setNewPromoCode] = useState("");
  const [commissionAmount, setCommissionAmount] = useState<number>(0);
  const [businessId, setBusinessId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPromoting, setIsPromoting] = useState(false);
  const [isGenerating, setIsGenerating] = useState<string | null>(null);
  const [dialogError, setDialogError] = useState<string | null>(null);
  const [notification, setNotification] = useState({ title: '', message: '', link: '' });
  const [searchTerm, setSearchTerm] = useState("");

  const ambassadorsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'ambassadors'));
  }, [firestore]);

  const { data: ambassadors, isLoading: isLoadingAmbassadors } = useCollection<Ambassador>(ambassadorsRef);

  const filteredAmbassadors = useMemo(() => {
    if (!ambassadors) return [];
    if (!searchTerm) return ambassadors;
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return ambassadors.filter((ambassador: Ambassador) =>
      ambassador.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
      ambassador.email.toLowerCase().includes(lowerCaseSearchTerm) ||
      (ambassador.referralCode || '').toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [ambassadors, searchTerm]);

  const resetDialog = () => {
    setSelectedAmbassador(null);
    setCommissionAmount(0);
    setBusinessId('');
    setDialogError(null);
  }

  const resetEditDialog = () => {
    setEditingAmbassador(null);
    setNewPromoCode('');
    setDialogError(null);
  }

  const resetNotificationDialog = () => {
    setNotifyingAmbassador(null);
    setNotification({ title: '', message: '', link: '' });
    setDialogError(null);
  }

  const getInitials = (name?: string) => {
    if (!name) return '??';
    const names = name.split(' ');
    return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : name.substring(0, 2);
  }

  const calculateAge = (dob?: string) => {
    if (!dob) return "N/A";
    try {
      return differenceInYears(new Date(), parseISO(dob));
    } catch (e) {
      return "N/A";
    }
  }

  const stats = useMemo(() => {
    if (!ambassadors) return { totalMonoyi: 0, totalFcfa: 0, activeEarners: 0 };
    const totalMonoyi = ambassadors.reduce((acc, curr) => acc + (curr.monoyi || 0), 0);
    const activeEarners = ambassadors.filter(a => (a.monoyi || 0) > 0).length;
    return {
      totalMonoyi,
      totalFcfa: totalMonoyi * 800,
      activeEarners
    };
  }, [ambassadors]);

  const handlePromoteToPartner = async (ambassador: Ambassador) => {
    if (!firestore) return;
    setIsPromoting(true);
    try {
      const ambassadorDocRef = doc(firestore, 'ambassadors', ambassador.id);
      const newRole = ambassador.role === 'partenaire' ? 'ambassadeur' : 'partenaire';
      await updateDoc(ambassadorDocRef, { role: newRole });
      toast({
        title: "Rôle mis à jour !",
        description: `${ambassador.name} est maintenant ${newRole === 'partenaire' ? 'Partenaire' : 'Ambassadeur'}.`
      });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Erreur", description: "La mise à jour du rôle a échoué." });
    } finally {
      setIsPromoting(false);
    }
  }

  const handleGenerateCode = async (ambassadorId: string) => {
    setIsGenerating(ambassadorId);
    try {
      const result = await generateAndAssignPromoCode(ambassadorId);
      if (result.error) throw new Error(result.error);

      toast({
        title: "Code généré !",
        description: `Le code ${result.newCode} a été assigné.`
      });
    } catch (error: any) {
      console.error(error);
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } finally {
      setIsGenerating(null);
    }
  }

  const handleUpdatePromoCode = async () => {
    if (!editingAmbassador || !newPromoCode) {
      setDialogError("Le nouveau code ne peut pas être vide.");
      return;
    }
    setIsSubmitting(true);
    setDialogError(null);
    try {
      const result = await updatePromoCode(editingAmbassador.id, newPromoCode);
      if (result.error) throw new Error(result.error);

      toast({
        title: "Code mis à jour !",
        description: `Le nouveau code de ${editingAmbassador.name} est maintenant ${result.newCode}.`
      });
      resetEditDialog();
    } catch (error: any) {
      console.error(error);
      setDialogError(error.message);
      toast({ variant: "destructive", title: "Erreur", description: error.message });
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleManualAddMonoyi = async () => {
    setDialogError(null);
    if (!selectedAmbassador || !firestore || commissionAmount <= 0 || !businessId) {
      setDialogError("Tous les champs sont obligatoires.");
      return;
    }

    setIsSubmitting(true);
    try {
      const monoyiEarned = Math.floor(commissionAmount / 800);

      if (monoyiEarned <= 0) {
        setDialogError("Le montant de la commission est trop faible pour générer des Monoyi.");
        setIsSubmitting(false);
        return;
      }

      const ambassadorDocRef = doc(firestore, 'ambassadors', selectedAmbassador.id);
      const clientReferralDocRef = doc(firestore, `ambassadors/${selectedAmbassador.id}/clientReferrals`, businessId);

      await runTransaction(firestore, async (transaction) => {
        const clientReferralDoc = await transaction.get(clientReferralDocRef);

        if (!clientReferralDoc.exists()) {
          transaction.set(clientReferralDocRef, {
            clientId: businessId, ambassadorId: selectedAmbassador.id,
            referralDate: new Date().toISOString(), isActive: true,
            commissionEarned: monoyiEarned,
          });
        } else {
          transaction.update(clientReferralDocRef, { isActive: true, commissionEarned: increment(monoyiEarned) });
        }
        transaction.update(ambassadorDocRef, { monoyi: increment(monoyiEarned) });
      });

      toast({
        title: "Succès !",
        description: `${monoyiEarned} Monoyi ont été ajoutés à ${selectedAmbassador.name} et le client ${businessId} a été marqué comme actif.`,
      });
      resetDialog();
    } catch (error) {
      console.error(error);
      setDialogError("La mise à jour a échoué. Vérifiez l'ID de l'entreprise et réessayez.");
      toast({ variant: "destructive", title: "Erreur", description: "La mise à jour des Monoyi a échoué." });
    } finally {
      setIsSubmitting(false);
    }
  }

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
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Gestion des Ambassadeurs</h1>
            <p className="text-muted-foreground">
              Suivez et gérez tous les ambassadeurs de la plateforme.
            </p>
          </div>
        </div>

        {/* Mini Dashboard Stats */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Distribution Totale</CardTitle>
              <DollarSign className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalFcfa.toLocaleString('fr-FR')} FCFA</div>
              <p className="text-xs text-muted-foreground">{stats.totalMonoyi.toFixed(2)} MYI au total</p>
            </CardContent>
          </Card>
          <Card className="bg-green-500/5 border-green-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ambassadeurs Payés</CardTitle>
              <UsersIcon className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeEarners}</div>
              <p className="text-xs text-muted-foreground">Ayant gagné au moins 1 Monoyi</p>
            </CardContent>
          </Card>
          <Card className="bg-blue-500/5 border-blue-500/20">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Activité Globale</CardTitle>
              <Activity className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ambassadors?.length || 0}</div>
              <p className="text-xs text-muted-foreground">Inscrits au programme</p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Ambassadeurs & Partenaires</CardTitle>
                <CardDescription>
                  {isLoadingAmbassadors ? 'Chargement...' : `${filteredAmbassadors?.length || 0} ambassadeurs trouvés.`}
                </CardDescription>
              </div>
              <div className="relative w-full sm:w-auto sm:max-w-xs">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher (nom, email, code)..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ambassadeur</TableHead>
                  <TableHead>Rôle</TableHead>
                  <TableHead>Code Promo</TableHead>
                  <TableHead>Gains (FCFA)</TableHead>
                  <TableHead>Monoyi</TableHead>
                  <TableHead>Niveau</TableHead>
                  <TableHead>Vérifié</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingAmbassadors ? (
                  Array.from({ length: 8 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="flex flex-col gap-1"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-32" /></div></div></TableCell>
                      <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-12" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-10" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-48 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : filteredAmbassadors.length > 0 ? (
                  filteredAmbassadors.map((ambassador: Ambassador) => (
                    <TableRow key={ambassador.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={(ambassador as any).avatarUrl} />
                            <AvatarFallback>{getInitials(ambassador.name)}</AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{ambassador.name}</div>
                            <div className="text-xs text-muted-foreground">{ambassador.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={ambassador.role === 'partenaire' ? 'default' : 'secondary'}>
                          {ambassador.role === 'partenaire' ? 'Partenaire' : 'Ambassadeur'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {ambassador.referralCode ? (
                          <Badge variant="outline">{ambassador.referralCode}</Badge>
                        ) : (
                          <Button variant="secondary" size="sm" onClick={() => handleGenerateCode(ambassador.id)} disabled={isGenerating === ambassador.id}>
                            {isGenerating === ambassador.id ? <Loader2 className="animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Gérer
                          </Button>
                        )}
                      </TableCell>
                      <TableCell className="font-bold text-green-600 dark:text-green-400">
                        {((ambassador.monoyi || 0) * 800).toLocaleString('fr-FR')} F
                      </TableCell>
                      <TableCell>{(ambassador.monoyi || 0).toFixed(2)}</TableCell>
                      <TableCell>{ambassador.level}</TableCell>
                      <TableCell>
                        <Badge variant={(ambassador as any).isVerified ? 'default' : 'secondary'} className={(ambassador as any).isVerified ? 'bg-green-100 text-green-800' : ''}>
                          {(ambassador as any).isVerified ? "Oui" : "Non"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex gap-2 justify-end">
                          <Button variant="outline" size="icon" className="h-9 w-9 border-primary/30 text-primary hover:bg-primary/10" onClick={() => setViewingAmbassador(ambassador)} title="Voir détails">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => setSelectedAmbassador(ambassador)}>Ajouter Monoyi</Button>
                          {ambassador.referralCode && (
                            <Button variant="outline" size="sm" onClick={() => { setEditingAmbassador(ambassador); setNewPromoCode(ambassador.referralCode); }}><Pencil className="mr-2 h-3 w-3" />Modifier</Button>
                          )}
                          <Button variant="outline" size="icon" className="h-9 w-9 text-blue-600 hover:bg-blue-50 border-blue-200" onClick={() => setNotifyingAmbassador(ambassador)} title="Notifier">
                            <Bell className="h-4 w-4" />
                          </Button>
                          <Button variant={ambassador.role === 'partenaire' ? "destructive" : "secondary"} size="sm" onClick={() => handlePromoteToPartner(ambassador)} disabled={isPromoting}>
                            {isPromoting ? <Loader2 className="animate-spin" /> : <Crown className="mr-2 h-4 w-4" />}
                            {ambassador.role === 'partenaire' ? 'Rétrograder' : 'Promouvoir'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow><TableCell colSpan={7} className="h-24 text-center">Aucun ambassadeur trouvé.</TableCell></TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedAmbassador} onOpenChange={(open) => !open && resetDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajouter des Monoyi manuellement</DialogTitle>
            <DialogDescription>Pour {selectedAmbassador?.name}. Le client associé sera marqué comme "actif".</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="businessId">ID de l'entreprise (de TTR Gestion)</Label>
              <Input id="businessId" type="text" value={businessId} onChange={(e) => setBusinessId(e.target.value)} placeholder="Ex: uqT7p..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="commissionAmount">Montant payé par le client (en FCFA)</Label>
              <Input id="commissionAmount" type="number" value={commissionAmount} onChange={(e) => setCommissionAmount(Number(e.target.value))} placeholder="Ex: 3500" />
            </div>
            {selectedAmbassador && commissionAmount > 0 && (
              <div className="text-sm text-muted-foreground p-3 bg-secondary rounded-md">Monoyi qui seront ajoutés : {Math.floor(commissionAmount / 800)}</div>
            )}
            {dialogError && (<Alert variant="destructive"><AlertDescription>{dialogError}</AlertDescription></Alert>)}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={resetDialog}>Annuler</Button>
            <Button onClick={handleManualAddMonoyi} disabled={isSubmitting || commissionAmount <= 0 || !businessId}>
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <MonoyiIcon className="mr-2" />} Ajouter
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingAmbassador} onOpenChange={(open) => !open && resetEditDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le Code Promo</DialogTitle>
            <DialogDescription>Pour {editingAmbassador?.name}. Attention, cette action mettra aussi à jour son lien de parrainage.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newPromoCode">Nouveau Code Promo</Label>
              <Input id="newPromoCode" type="text" value={newPromoCode} onChange={(e) => setNewPromoCode(e.target.value)} placeholder="Ex: NOUVEAUCODE24" />
            </div>
            {dialogError && (<Alert variant="destructive"><AlertDescription>{dialogError}</AlertDescription></Alert>)}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={resetEditDialog}>Annuler</Button>
            <Button onClick={handleUpdatePromoCode} disabled={isSubmitting || !newPromoCode}>
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Pencil className="mr-2 h-4 w-4" />} Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!notifyingAmbassador} onOpenChange={(open) => !open && resetNotificationDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Envoyer une notification</DialogTitle>
            <DialogDescription>Envoyer une notification ciblée à {notifyingAmbassador?.name}.</DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="notifTitle">Titre</Label>
              <Input id="notifTitle" value={notification.title} onChange={(e) => setNotification({ ...notification, title: e.target.value })} placeholder="Titre de la notification" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notifMessage">Message</Label>
              <Textarea id="notifMessage" value={notification.message} onChange={(e) => setNotification({ ...notification, message: e.target.value })} placeholder="Contenu de la notification..." />
            </div>
            <div className="space-y-2">
              <Label htmlFor="notifLink">Lien (Optionnel)</Label>
              <Input id="notifLink" value={notification.link} onChange={(e) => setNotification({ ...notification, link: e.target.value })} placeholder="/dashboard/news" />
            </div>
            {dialogError && (<Alert variant="destructive"><AlertDescription>{dialogError}</AlertDescription></Alert>)}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={resetNotificationDialog}>Annuler</Button>
            <Button onClick={handleSendNotification} disabled={isSubmitting || !notification.title || !notification.message}>
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : <Bell className="mr-2 h-4 w-4" />} Envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <Dialog open={!!viewingAmbassador} onOpenChange={(open) => !open && setViewingAmbassador(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Détails de l'Ambassadeur</DialogTitle>
            <DialogDescription>Profil complet de {viewingAmbassador?.name}</DialogDescription>
          </DialogHeader>
          {viewingAmbassador && (
            <div className="py-4 space-y-6">
              <div className="flex items-center gap-4 border-b pb-4">
                <Avatar className="h-16 w-16 text-xl">
                  <AvatarImage src={(viewingAmbassador as any).avatarUrl} />
                  <AvatarFallback>{getInitials(viewingAmbassador.name)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-bold">{viewingAmbassador.name}</h3>
                  <p className="text-muted-foreground text-sm">{viewingAmbassador.email}</p>
                  <Badge className="mt-1" variant={viewingAmbassador.role === 'partenaire' ? 'default' : 'secondary'}>
                    {viewingAmbassador.role === 'partenaire' ? 'Partenaire' : 'Ambassadeur'}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase font-bold">Âge</Label>
                  <p className="font-medium text-sm">{calculateAge(viewingAmbassador.dob)} ans</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase font-bold">Lieu / Pays</Label>
                  <p className="font-medium text-sm">{viewingAmbassador.country || "Non renseigné"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase font-bold">Statut Vérification</Label>
                  <div>
                    <Badge variant={(viewingAmbassador as any).isVerified ? 'default' : 'secondary'} className={(viewingAmbassador as any).isVerified ? 'bg-green-100 text-green-800' : ''}>
                      {(viewingAmbassador as any).isVerified ? "Vérifié" : viewingAmbassador.verificationStatus || "Non vérifié"}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase font-bold">Méthode Paiement</Label>
                  <p className="font-medium text-sm capitalize">{viewingAmbassador.payoutMethod || "Non renseignée"}</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase font-bold">Solde Monoyi</Label>
                  <p className="font-medium text-sm text-primary">{(viewingAmbassador.monoyi || 0).toFixed(2)} MYI</p>
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] text-muted-foreground uppercase font-bold">Valeur Gains</Label>
                  <p className="font-medium text-sm text-green-600">{((viewingAmbassador.monoyi || 0) * 800).toLocaleString('fr-FR')} F</p>
                </div>
              </div>

              {viewingAmbassador.feedback && (
                <div className="space-y-1 bg-secondary/30 p-3 rounded-md border border-secondary">
                  <Label className="text-[10px] text-muted-foreground uppercase font-bold">Comment nous a-t-il connu ?</Label>
                  <p className="text-sm italic text-muted-foreground">"{viewingAmbassador.feedback}"</p>
                </div>
              )}

              <div className="pt-4 border-t flex gap-2">
                <Button className="w-full" variant="outline" onClick={() => { setViewingAmbassador(null); setNotifyingAmbassador(viewingAmbassador); }}>
                  <Bell className="mr-2 h-4 w-4" /> Notifier
                </Button>
                <Button className="w-full" onClick={() => setViewingAmbassador(null)}>
                  Fermer
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
