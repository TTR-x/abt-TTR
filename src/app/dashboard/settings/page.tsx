
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase, useAuth } from '@/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import type { Ambassador } from '@/lib/api';
import { sendEmailVerification } from 'firebase/auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, ShieldAlert, Clock, MailCheck, MailWarning } from 'lucide-react';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import LoadingLink from '@/components/loading-link';

const countries = [
    { name: "Sénégal", code: "sn" }, { name: "Mali", code: "ml" }, { name: "Guinée", code: "gn" },
    { name: "Côte d’Ivoire", code: "ci" }, { name: "Burkina Faso", code: "bf" }, { name: "Bénin", code: "bj" },
    { name: "Togo", code: "tg" }, { name: "Niger", code: "ne" }, { name: "Mauritanie", code: "mr" },
    { name: "Burundi", code: "bi" }, { name: "Rwanda", code: "rw" }, { name: "Djibouti", code: "dj" },
    { name: "Congo-Brazzaville", code: "cg" }, { name: "Congo-Kinshasa", code: "cd" }, { name: "Madagascar", code: "mg" },
    { name: "France", code: "fr" }, { name: "Belgique", code: "be" }, { name: "Suisse", code: "ch" },
];

export default function SettingsPage() {
  const { user: authUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const { toast } = useToast();

  const ambassadorRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'ambassadors', authUser.uid);
  }, [firestore, authUser]);

  const { data: ambassador, isLoading: isLoadingAmbassador } = useDoc<Ambassador>(ambassadorRef);

  const [name, setName] = useState('');
  const [country, setCountry] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  
  const verificationStatus = (ambassador as any)?.verificationStatus || 'not_verified';
  const isEmailVerified = authUser?.emailVerified || false;


  useEffect(() => {
    if (ambassador) {
      setName(ambassador.name);
      setCountry((ambassador as any).country || '');
    }
  }, [ambassador]);

  const handleSaveChanges = async () => {
    if (!ambassadorRef) return;
    
    setIsSaving(true);
    try {
        setDocumentNonBlocking(ambassadorRef, { name, country }, { merge: true });
        toast({
            title: 'Succès',
            description: 'Vos informations ont été mises à jour.',
        });
    } catch (error) {
        console.error("Error updating profile: ", error);
        toast({
            variant: 'destructive',
            title: 'Erreur',
            description: 'Impossible de mettre à jour vos informations.',
        });
    } finally {
        setIsSaving(false);
    }
  };

  const handleSendVerificationEmail = async () => {
    if (!authUser) return;
    setIsSendingVerification(true);
    try {
        await sendEmailVerification(authUser);
        toast({
            title: 'E-mail envoyé !',
            description: 'Veuillez consulter votre boîte de réception pour vérifier votre adresse e-mail.',
        });
    } catch (error) {
        console.error("Error sending verification email:", error);
        toast({
            variant: 'destructive',
            title: 'Erreur',
            description: "Impossible d'envoyer l'e-mail de vérification.",
        });
    } finally {
        setIsSendingVerification(false);
    }
  };
  
  if (isUserLoading || isLoadingAmbassador) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingIndicator />
      </div>
    );
  }

  const getVerificationComponent = () => {
    switch (verificationStatus) {
        case 'verified':
            return {
                icon: <ShieldCheck className="h-6 w-6 text-green-500" />,
                badge: <Badge className='bg-green-100 text-green-800'>Vérifié</Badge>,
                button: null
            };
        case 'pending':
            return {
                icon: <Clock className="h-6 w-6 text-yellow-500" />,
                badge: <Badge variant='secondary' className='bg-yellow-100 text-yellow-800'>En attente</Badge>,
                button: <Button disabled>Vérification en cours</Button>
            };
        case 'rejected':
             return {
                icon: <ShieldAlert className="h-6 w-6 text-destructive" />,
                badge: <Badge variant='destructive'>Rejeté</Badge>,
                button: <Button asChild><LoadingLink href="/dashboard/verify">Soumettre à nouveau</LoadingLink></Button>
            };
        default: // not_verified
            return {
                icon: <ShieldAlert className="h-6 w-6 text-gray-500" />,
                badge: <Badge variant='secondary'>Non Vérifié</Badge>,
                button: <Button asChild><LoadingLink href="/dashboard/verify">Commencer la vérification</LoadingLink></Button>
            };
    }
  }

  const verificationUI = getVerificationComponent();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Paramètres du Compte</h1>
        <p className="text-muted-foreground">
          Gérez les informations de votre profil et vos préférences.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profil Public</CardTitle>
          <CardDescription>
            Ces informations peuvent être visibles par d'autres utilisateurs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Nom complet</Label>
            <Input id="name" value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Adresse e-mail</Label>
            <Input id="email" value={ambassador?.email || ''} disabled />
            <p className="text-xs text-muted-foreground">L'adresse e-mail ne peut pas être modifiée.</p>
          </div>
           <div className="space-y-2">
            <Label htmlFor="country">Pays</Label>
            <Select value={country} onValueChange={setCountry}>
              <SelectTrigger id="country">
                <SelectValue placeholder="Sélectionnez un pays" />
              </SelectTrigger>
              <SelectContent>
                {countries.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button onClick={handleSaveChanges} disabled={isSaving}>
            {isSaving ? <LoadingIndicator className="h-5 w-5"/> : 'Enregistrer les modifications'}
          </Button>
        </CardFooter>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Sécurité du Compte</CardTitle>
           <CardDescription>
            Gérez la sécurité et la vérification de votre compte.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-4 rounded-md border p-4">
            {isEmailVerified ? <MailCheck className="h-6 w-6 text-green-500" /> : <MailWarning className="h-6 w-6 text-yellow-500" />}
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                 Vérification de l'e-mail
              </p>
              {isEmailVerified ? (
                 <Badge className='bg-green-100 text-green-800'>E-mail vérifié</Badge>
              ) : (
                 <Badge variant='secondary' className='bg-yellow-100 text-yellow-800'>E-mail non vérifié</Badge>
              )}
            </div>
            {!isEmailVerified && (
                <Button onClick={handleSendVerificationEmail} disabled={isSendingVerification}>
                    {isSendingVerification ? <LoadingIndicator className="h-5 w-5" /> : "Envoyer l'e-mail de vérification"}
                </Button>
            )}
          </div>

          <div className="flex items-center space-x-4 rounded-md border p-4">
            {verificationUI.icon}
            <div className="flex-1 space-y-1">
              <p className="text-sm font-medium leading-none">
                 Vérification du Profil
              </p>
              {verificationUI.badge}
            </div>
            {verificationUI.button}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
