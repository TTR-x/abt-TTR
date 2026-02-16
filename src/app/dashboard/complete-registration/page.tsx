'use client';

import { useActionState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useFormStatus } from 'react-dom';
import { completeRegistration } from '@/app/actions';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

const countries = [
    { name: "Sénégal", code: "sn" },
    { name: "Mali", code: "ml" },
    { name: "Guinée", code: "gn" },
    { name: "Côte d’Ivoire", code: "ci" },
    { name: "Burkina Faso", code: "bf" },
    { name: "Bénin", code: "bj" },
    { name: "Togo", code: "tg" },
    { name: "Niger", code: "ne" },
    { name: "Mauritanie", code: "mr" },
    { name: "Burundi", code: "bi" },
    { name: "Rwanda", code: "rw" },
    { name: "Djibouti", code: "dj" },
    { name: "Congo-Brazzaville", code: "cg" },
    { name: "Congo-Kinshasa", code: "cd" },
    { name: "Madagascar", code: "mg" },
    { name: "France", code: "fr" },
    { name: "Belgique", code: "be" },
    { name: "Suisse", code: "ch" },
];

const feedbackOptions = [
    "Réseaux sociaux (Facebook, Instagram, etc.)",
    "Recommandation d'un ami ou collègue",
    "Recherche sur Google",
    "Publicité en ligne",
    "Autre"
];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <LoadingIndicator className="h-6 w-6" /> : "Terminer l'inscription"}
    </Button>
  );
}

export default function CompleteRegistrationPage({ authUser }: { authUser: any }) {
  const [state, formAction] = useActionState(completeRegistration, null);
  const router = useRouter();

  // The redirection is now handled by the server action `completeRegistration` using `redirect()`.
  // The client-side redirection is no longer necessary.

  if (!authUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader>
          <CardTitle className="text-2xl">Finaliser votre inscription</CardTitle>
          <CardDescription>
            Encore une petite étape ! Complétez votre profil pour accéder à votre tableau de bord.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-4">
            {/* Hidden inputs to pass user info */}
            <input type="hidden" name="uid" value={authUser.uid} />
            <input type="hidden" name="email" value={authUser.email} />
            {/* The name comes from the signup form, pass it along */}
            <input type="hidden" name="name" value={authUser.displayName || ''} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="grid gap-2">
                    <Label>Date de naissance</Label>
                    <div className="grid grid-cols-3 gap-2">
                        <Input name="dob-day" placeholder="JJ" type="number" min="1" max="31" required />
                        <Input name="dob-month" placeholder="MM" type="number" min="1" max="12" required />
                        <Input name="dob-year" placeholder="AAAA" type="number" min="1950" max={new Date().getFullYear() - 15} required />
                    </div>
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="country">Pays</Label>
                    <Select name="country" required>
                        <SelectTrigger id="country">
                            <SelectValue placeholder="Sélectionnez un pays" />
                        </SelectTrigger>
                        <SelectContent>
                            {countries.map(c => <SelectItem key={c.code} value={c.name}>{c.name}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid gap-2">
                <Label>Moyen de retrait</Label>
                <RadioGroup name="payoutMethod" className="flex gap-4" required defaultValue="mobile-money">
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="visa" id="visa" />
                        <Label htmlFor="visa">Visa</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                        <RadioGroupItem value="mobile-money" id="mobile-money" />
                        <Label htmlFor="mobile-money">Mobile Money</Label>
                    </div>
                </RadioGroup>
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="referralCode">Code de parrainage (Optionnel)</Label>
              <Input id="referralCode" name="referralCode" placeholder="ex: ABCD24" />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="feedback">Comment avez-vous entendu parler de nous ?</Label>
              <Select name="feedback" required>
                <SelectTrigger id="feedback">
                  <SelectValue placeholder="Sélectionnez une option" />
                </SelectTrigger>
                <SelectContent>
                  {feedbackOptions.map(opt => <SelectItem key={opt} value={opt}>{opt}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {state?.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
