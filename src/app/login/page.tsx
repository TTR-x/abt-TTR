
'use client';

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff, CheckCircle } from "lucide-react";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { useEffect, useState, FormEvent, Suspense, useActionState } from "react";
import { useFormStatus } from 'react-dom';
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useUser } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { signupUser } from "@/app/actions";

function PasswordInput({ id, name, required = true }: { id: string, name: string, required?: boolean }) {
  const [showPassword, setShowPassword] = useState(false);
  return (
    <div className="relative">
      <Input id={id} name={name} type={showPassword ? "text" : "password"} required={required} />
      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground"
      >
        {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}

function LoginTab() {
    const [error, setError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const auth = useAuth();

    const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);
        const formData = new FormData(event.currentTarget);
        const email = formData.get('email') as string;
        const password = formData.get('password') as string;

        if (!auth) {
            setError('Service d\'authentification non disponible.');
            setIsSubmitting(false);
            return;
        }

        if (!email || !password) {
          setError('Veuillez remplir tous les champs.');
          setIsSubmitting(false);
          return;
        }

        try {
          await signInWithEmailAndPassword(auth, email, password);
          // La redirection est gérée par le useEffect dans AuthPageContent
        } catch (error: any) {
          if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password' || error.code === 'auth/user-not-found') {
              setError('Email ou mot de passe incorrect.');
          } else {
              setError(`Une erreur est survenue: ${error.message}`);
          }
        } finally {
          setIsSubmitting(false);
        }
    };
    
    return (
        <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-2xl">Connexion</CardTitle>
              <CardDescription>
                Entrez vos identifiants pour accéder à votre tableau de bord.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email-login">Email</Label>
                  <Input id="email-login" type="email" name="email" placeholder="m@example.com" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password-login">Mot de passe</Label>
                  <PasswordInput id="password-login" name="password" />
                </div>

                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <Button type="submit" className="w-full" disabled={isSubmitting}>
                  {isSubmitting ? <LoadingIndicator className="h-6 w-6" /> : "Se connecter"}
                </Button>
              </form>
            </CardContent>
        </Card>
    );
}

function SignupSubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full" disabled={pending}>
            {pending ? <LoadingIndicator className="h-6 w-6" /> : "Créer un compte"}
        </Button>
    )
}

function SignupTab() {
    const [state, formAction] = useActionState(signupUser, null);

    if (state?.success) {
      return (
        <Card className="bg-card text-card-foreground">
          <CardContent className="p-6 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Inscription réussie !</h2>
            <p className="text-muted-foreground mb-6">
              Votre code promo a été généré. Connectez-vous maintenant pour commencer votre aventure.
            </p>
            <Alert>
              <AlertDescription>
                Un email de vérification pourrait vous être envoyé.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      )
    }
    
    return (
        <Card className="bg-card text-card-foreground">
            <CardHeader>
              <CardTitle className="text-2xl">Créer un compte</CardTitle>
              <CardDescription>
                Remplissez vos informations pour devenir ambassadeur. Votre code promo sera généré automatiquement.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form action={formAction} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nom complet (min 6 caractères)</Label>
                  <Input id="name" name="name" placeholder="John Doe" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email-signup">Email</Label>
                  <Input id="email-signup" type="email" name="email" placeholder="m@example.com" required />
                </div>
                <div className="grid gap-2">
                    <Label htmlFor="password-signup">Mot de passe (min 6 caractères)</Label>
                    <PasswordInput id="password-signup" name="password" />
                </div>
                
                {state?.error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{state.error}</AlertDescription>
                  </Alert>
                )}

                <SignupSubmitButton />
              </form>
            </CardContent>
          </Card>
    );
}

function AuthPageContent() {
  const router = useRouter();
  const { user: authUser, isUserLoading } = useUser();
  
  useEffect(() => {
    if (!isUserLoading && authUser) {
      router.push('/dashboard');
    }
  }, [authUser, isUserLoading, router]);

  if (isUserLoading || authUser) {
    return (
        <div className="flex items-center justify-center min-h-screen">
            <LoadingIndicator />
        </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <Tabs defaultValue="login" className="w-full max-w-2xl">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Se connecter</TabsTrigger>
          <TabsTrigger value="signup">S'inscrire</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <LoginTab />
        </TabsContent>
        <TabsContent value="signup">
          <SignupTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default function AuthPage() {
    return (
        <Suspense fallback={<div className="flex items-center justify-center min-h-screen"><LoadingIndicator /></div>}>
            <AuthPageContent />
        </Suspense>
    )
}

    