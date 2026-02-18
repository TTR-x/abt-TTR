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
import { AlertCircle, CheckCircle, Eye, EyeOff, UserPlus, ArrowLeft } from "lucide-react";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { useState, Suspense, useEffect } from "react";
import { useFormStatus } from 'react-dom';
import { useActionState } from "react";
import { useRouter } from "next/navigation";
import { useUser } from "@/firebase";
import { signupUser } from "@/app/actions";
import Link from "next/link";

function PasswordInput({ id, name }: { id: string; name: string }) {
    const [show, setShow] = useState(false);
    return (
        <div className="relative">
            <Input id={id} name={name} type={show ? "text" : "password"} required minLength={6} />
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

function SubmitButton() {
    const { pending } = useFormStatus();
    return (
        <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={pending}>
            {pending ? (
                <span className="flex items-center gap-2">
                    <LoadingIndicator className="h-5 w-5" />
                    Création en cours...
                </span>
            ) : (
                <span className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    Créer mon compte
                </span>
            )}
        </Button>
    );
}

function RegisterContent() {
    const router = useRouter();
    const { user: authUser, isUserLoading } = useUser();
    const [state, formAction] = useActionState(signupUser, null);

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

    if (state?.success) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background p-4">
                <Card className="w-full max-w-md text-center shadow-xl">
                    <CardContent className="p-10">
                        <div className="flex justify-center mb-6">
                            <div className="rounded-full bg-green-100 dark:bg-green-900/30 p-4">
                                <CheckCircle className="h-14 w-14 text-green-500" />
                            </div>
                        </div>
                        <h2 className="text-2xl font-bold mb-2">Inscription réussie !</h2>
                        <p className="text-muted-foreground mb-6">
                            Votre compte ambassadeur a été créé et votre code promo a été généré automatiquement.
                        </p>
                        <Button asChild className="w-full h-11">
                            <Link href="/login">Se connecter maintenant</Link>
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4">
            <div className="w-full max-w-md space-y-4">
                {/* Lien retour */}
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour à la connexion
                </Link>

                <Card className="shadow-xl">
                    <CardHeader className="space-y-1 pb-4">
                        <div className="flex justify-center mb-2">
                            <div className="rounded-full bg-primary/10 p-3">
                                <UserPlus className="h-8 w-8 text-primary" />
                            </div>
                        </div>
                        <CardTitle className="text-2xl text-center">Créer un compte</CardTitle>
                        <CardDescription className="text-center">
                            Rejoignez le réseau d'ambassadeurs TTR. Votre code promo sera généré automatiquement à l'inscription.
                        </CardDescription>
                    </CardHeader>

                    <CardContent>
                        <form action={formAction} className="grid gap-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name">Nom complet</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Jean Dupont"
                                    required
                                    minLength={2}
                                    autoComplete="name"
                                />
                            </div>

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
                                <p className="text-xs text-muted-foreground">Minimum 6 caractères</p>
                            </div>

                            {state?.error && (
                                <Alert variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>{state.error}</AlertDescription>
                                </Alert>
                            )}

                            <SubmitButton />

                            <p className="text-center text-sm text-muted-foreground">
                                Déjà un compte ?{' '}
                                <Link href="/login" className="text-primary font-medium hover:underline">
                                    Se connecter
                                </Link>
                            </p>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}

export default function RegisterPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <LoadingIndicator />
            </div>
        }>
            <RegisterContent />
        </Suspense>
    );
}
