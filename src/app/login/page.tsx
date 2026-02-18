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
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Eye, EyeOff, LogIn } from "lucide-react";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { useState, FormEvent, Suspense, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth, useUser } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import Link from "next/link";

function PasswordInput({ id, name }: { id: string; name: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input id={id} name={name} type={show ? "text" : "password"} required />
      <button
        type="button"
        onClick={() => setShow(!show)}
        className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground transition-colors"
      >
        {show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
      </button>
    </div>
  );
}

function LoginContent() {
  const router = useRouter();
  const { user: authUser, isUserLoading } = useUser();
  const auth = useAuth();
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    const formData = new FormData(event.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!auth) {
      setError("Service d'authentification non disponible.");
      setIsSubmitting(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      // Redirection gérée par le useEffect
    } catch (err: any) {
      if (
        err.code === 'auth/invalid-credential' ||
        err.code === 'auth/wrong-password' ||
        err.code === 'auth/user-not-found'
      ) {
        setError('Email ou mot de passe incorrect.');
      } else {
        setError(`Une erreur est survenue: ${err.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-md space-y-4">
        <Card className="shadow-xl">
          <CardHeader className="space-y-1 pb-4">
            <div className="flex justify-center mb-2">
              <div className="rounded-full bg-primary/10 p-3">
                <LogIn className="h-8 w-8 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Connexion</CardTitle>
            <CardDescription className="text-center">
              Entrez vos identifiants pour accéder à votre tableau de bord ambassadeur.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleLogin} className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Adresse email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="jean@exemple.com"
                  required
                  autoComplete="email"
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="password">Mot de passe</Label>
                <PasswordInput id="password" name="password" />
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <LoadingIndicator className="h-5 w-5" />
                    Connexion...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <LogIn className="h-5 w-5" />
                    Se connecter
                  </span>
                )}
              </Button>

              <p className="text-center text-sm text-muted-foreground">
                Pas encore de compte ?{' '}
                <Link href="/register" className="text-primary font-medium hover:underline">
                  Créer un compte
                </Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <LoadingIndicator />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}