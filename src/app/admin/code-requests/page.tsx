
'use client';

import { useState, useMemo } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, where, orderBy } from 'firebase/firestore';
import type { Ambassador } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Check } from 'lucide-react';
import { updatePromoCode } from '@/app/actions';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';

export default function AdminCodeRequestsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [selectedAmbassador, setSelectedAmbassador] = useState<Ambassador | null>(null);
  const [promoCode, setPromoCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dialogError, setDialogError] = useState<string | null>(null);

  const pendingAmbassadorsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    // Query for ambassadors that do not have a referral code set yet.
    return query(collection(firestore, 'ambassadors'), where('referralCode', '==', ''), orderBy('createdAt', 'desc'));
  }, [firestore]);

  const { data: pendingAmbassadors, isLoading } = useCollection<Ambassador>(pendingAmbassadorsRef);
  
  const handleOpenDialog = (ambassador: Ambassador) => {
    setSelectedAmbassador(ambassador);
    setPromoCode(ambassador.promoCodeSuggestion || '');
    setDialogError(null);
  };
  
  const handleCloseDialog = () => {
      setSelectedAmbassador(null);
      setPromoCode('');
      setIsSubmitting(false);
      setDialogError(null);
  }

  const handleApproveCode = async () => {
    if (!selectedAmbassador || !promoCode) {
      setDialogError('Le code promo ne peut pas être vide.');
      return;
    }
    
    setIsSubmitting(true);
    setDialogError(null);

    const result = await updatePromoCode(selectedAmbassador.id, promoCode);

    if (result.error) {
      setDialogError(result.error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: result.error,
      });
    } else {
      toast({
        title: 'Code Approuvé !',
        description: `Le code "${result.newCode}" a été assigné à ${selectedAmbassador.name}.`,
      });
      handleCloseDialog();
    }
    
    setIsSubmitting(false);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Demandes de Code Promo</h1>
          <p className="text-muted-foreground">
            Validez les suggestions de codes promo des nouveaux ambassadeurs.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Demandes en Attente</CardTitle>
            <CardDescription>
              {isLoading ? 'Chargement...' : `${pendingAmbassadors?.length || 0} ambassadeurs en attente de code.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nom</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Date d'inscription</TableHead>
                  <TableHead>Suggestion de Code</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-9 w-24 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : pendingAmbassadors && pendingAmbassadors.length > 0 ? (
                  pendingAmbassadors.map((ambassador) => (
                    <TableRow key={ambassador.id}>
                      <TableCell className="font-medium">{ambassador.name}</TableCell>
                      <TableCell className="text-muted-foreground">{ambassador.email}</TableCell>
                      <TableCell>{formatDate(ambassador.createdAt)}</TableCell>
                      <TableCell>
                        <span className="font-mono text-sm bg-secondary px-2 py-1 rounded-md">
                          {ambassador.promoCodeSuggestion || <span className="text-muted-foreground italic">Aucune</span>}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => handleOpenDialog(ambassador)}>
                          Valider le code
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      Aucune nouvelle demande pour le moment.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedAmbassador} onOpenChange={(open) => !open && handleCloseDialog()}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Valider le code pour {selectedAmbassador?.name}</DialogTitle>
            <DialogDescription>
              Vérifiez la suggestion ou entrez un nouveau code promo. Il sera vérifié pour s'assurer qu'il est unique.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="promo-code">Code Promo</Label>
              <Input
                id="promo-code"
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                placeholder="ex: codeunique24"
              />
               <p className="text-xs text-muted-foreground">Doit contenir entre 4 et 8 caractères, sans espaces ni symboles.</p>
            </div>
            {dialogError && (
              <Alert variant="destructive">
                <AlertDescription>{dialogError}</AlertDescription>
              </Alert>
            )}
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={handleCloseDialog}>Annuler</Button>
            <Button onClick={handleApproveCode} disabled={isSubmitting || !promoCode}>
              {isSubmitting ? <Loader2 className="mr-2 animate-spin" /> : <Check className="mr-2" />}
              Approuver & Activer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
