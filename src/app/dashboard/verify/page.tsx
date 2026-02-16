
'use client';

import { useState, useEffect } from 'react';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import type { Ambassador } from '@/lib/api';

export default function VerifyPage() {
  const { user: authUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const router = useRouter();
  const { toast } = useToast();

  const ambassadorRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return doc(firestore, 'ambassadors', authUser.uid);
  }, [firestore, authUser]);
  
  const { data: ambassador, isLoading: isLoadingAmbassador } = useDoc<Ambassador>(ambassadorRef);

  const [formData, setFormData] = useState({
    fullName: '',
    whatsappNumber: '',
    geolocationLink: '',
    city: '',
    neighborhood: '',
    jobFunction: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
      if (ambassador) {
          setFormData(prev => ({
              ...prev,
              fullName: (ambassador as any).verificationInfo?.fullName || ambassador.name || '',
              whatsappNumber: (ambassador as any).verificationInfo?.whatsappNumber || '',
              geolocationLink: (ambassador as any).verificationInfo?.geolocationLink || '',
              city: (ambassador as any).verificationInfo?.city || '',
              neighborhood: (ambassador as any).verificationInfo?.neighborhood || '',
              jobFunction: (ambassador as any).verificationInfo?.jobFunction || '',
          }));
          
          if (ambassador.verificationStatus === 'pending' || ambassador.verificationStatus === 'verified') {
              router.replace('/dashboard');
          }
      }
  }, [ambassador, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    // Basic validation
    for (const key in formData) {
      if (!formData[key as keyof typeof formData]) {
        setError('Tous les champs sont obligatoires.');
        return;
      }
    }
    
    if (!ambassadorRef) {
        setError("Impossible d'identifier l'utilisateur. Veuillez vous reconnecter.");
        return;
    }

    setIsSubmitting(true);
    try {
      await setDoc(ambassadorRef, {
        verificationInfo: {
          ...formData,
          submissionDate: new Date().toISOString(),
        },
        verificationStatus: 'pending',
      }, { merge: true });
      toast({
        title: 'Demande envoyée !',
        description: 'Votre demande de vérification a été soumise. Vous allez être redirigé...',
      });
      // Use window.location to force a full page reload, avoiding race conditions with client-side navigation.
      window.location.href = '/dashboard';
    } catch (err) {
      console.error(err);
      setError("Une erreur est survenue lors de la soumission de votre demande.");
      toast({ variant: 'destructive', title: 'Erreur', description: "Impossible d'envoyer la demande." });
    } finally {
      // This will likely not be reached due to the page reload, but it's good practice.
      setIsSubmitting(false);
    }
  };
  
  if (isUserLoading || isLoadingAmbassador) {
      return (
          <div className="flex items-center justify-center h-full">
              <LoadingIndicator />
          </div>
      )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>Vérification de votre profil</CardTitle>
            <CardDescription>
              Veuillez remplir les informations ci-dessous. Ces données resteront confidentielles et serviront uniquement à vérifier votre identité en tant qu'ambassadeur actif.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Attention</AlertTitle>
              <AlertDescription>
                Si vous mentez sur vos informations personnelles, vous risquez la suspension définitive de votre compte.
              </AlertDescription>
            </Alert>
            
            <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <Label htmlFor="fullName">Nom complet (vrai nom)</Label>
                    <Input id="fullName" name="fullName" value={formData.fullName} onChange={handleInputChange} placeholder="Ex: Jean Dupont" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="whatsappNumber">Numéro WhatsApp</Label>
                    <Input id="whatsappNumber" name="whatsappNumber" value={formData.whatsappNumber} onChange={handleInputChange} placeholder="Ex: +228 90123456" required />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="city">Ville</Label>
                    <Input id="city" name="city" value={formData.city} onChange={handleInputChange} placeholder="Ex: Lomé" required />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="neighborhood">Quartier</Label>
                    <Input id="neighborhood" name="neighborhood" value={formData.neighborhood} onChange={handleInputChange} placeholder="Ex: Adidogomé" required />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="jobFunction">Fonction / Profession</Label>
                    <Input id="jobFunction" name="jobFunction" value={formData.jobFunction} onChange={handleInputChange} placeholder="Ex: Commerçant, Étudiant, Agent commercial" required />
                </div>
                <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="geolocationLink">Lien de votre géolocalisation</Label>
                    <Textarea id="geolocationLink" name="geolocationLink" value={formData.geolocationLink} onChange={handleInputChange} placeholder="Ex: Collez le lien Google Maps de votre position actuelle ou de votre lieu de travail." required />
                    <p className="text-xs text-muted-foreground">Ouvrez Google Maps, faites un appui long sur votre position, puis cliquez sur "Partager" et "Copier le lien".</p>
                </div>
            </div>

            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}

          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? <Loader2 className="animate-spin mr-2" /> : null}
              Envoyer pour vérification
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  );
}
