
'use client';

import { useUser, useAuth } from '@/firebase';
import { useFormState, useFormStatus } from 'react-dom';
import { sendSupportMessage } from '@/app/actions';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Icons } from "@/components/icons";
import { Menu, Mail, Loader2, Send, CheckCircle, AlertCircle, UserPlus, LogIn } from "lucide-react";
import LoadingLink from "@/components/loading-link";
import PromotionalBanner from "@/components/promotional-banner";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import { Suspense, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { LoadingIndicator } from '@/components/ui/loading-indicator';

const ThemeToggle = dynamic(() => import('@/components/theme-toggle').then(mod => mod.ThemeToggle), {
  ssr: false,
  loading: () => <div className="w-10 h-10" />
});

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
      {pending ? 'Envoi en cours...' : 'Envoyer le message'}
    </Button>
  );
}

const faqItems = [
  {
    question: "Comment puis-je gagner de l'argent avec TTR Gestion ?",
    answer: "En tant qu'ambassadeur, vous gagnez de l'argent en percevant des commissions pour chaque client qui s'abonne à l'application TTRGESTION via votre code promo. C'est une excellente opportunité de travail en ligne pour générer un complément de revenu."
  },
  {
    question: "Quel est le rôle d'un ambassadeur pour TTR Gestion ?",
    answer: "Votre mission est de promouvoir l'application TTRGESTION. En utilisant le marketing d'affiliation, vous partagez votre code promo unique. C'est un travail à domicile flexible où vous êtes votre propre patron."
  },
  {
    question: "Combien coûte l'inscription au programme ambassadeur ?",
    answer: "Rien ! L'inscription à notre programme d'affiliation est entièrement gratuite. Nous vous fournissons tous les outils pour commencer à gagner de l'argent en ligne sans aucun investissement de votre part."
  },
  {
      question: "Qu'est-ce que l'application TTRGESTION pour les commerçants ?",
      answer: "TTRGESTION est une application mobile simple conçue pour les petits commerçants. Elle fonctionne comme un cahier numérique intelligent pour suivre les ventes, les dépenses, les stocks et calculer automatiquement les bénéfices, sans nécessiter de compétences en comptabilité."
  },
  {
    question: "Comment puis-je suivre mes commissions et mes parrainages ?",
    answer: "Votre tableau de bord personnel est votre centre de commande pour votre travail en ligne. Vous y trouverez des statistiques détaillées sur le nombre d'inscriptions, les clients actifs, et le montant total de vos commissions."
  },
  {
      question: "TTRGESTION est-elle une banque ou stocke-t-elle de l'argent ?",
      answer: "Non, TTRGESTION n'est pas une banque et ne stocke pas d'argent. C'est un outil de gestion purement destiné à aider les commerçants à mieux suivre leur activité commerciale pour optimiser leurs revenus."
  },
  {
    question: "Dans quels pays ce travail en ligne est-il disponible ?",
    answer: "Notre programme d'ambassadeurs est ouvert dans de nombreux pays en Afrique et en Europe, vous permettant de gagner de l'argent en ligne où que vous soyez. Consultez la liste complète sur notre page d'accueil."
  }
];

export default function SupportPage() {
  const { user, isUserLoading } = useUser();
  const [state, formAction] = useFormState(sendSupportMessage, null);
  const [isClient, setIsClient] = useState(false);
  
  useEffect(() => {
    setIsClient(true);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 px-4 lg:px-6 h-16 flex items-center bg-background/30 backdrop-blur-sm shadow-sm">
        <LoadingLink href="/" className="flex items-center justify-center gap-2">
          <Icons.logo className="h-8 w-auto" />
          <span className="font-semibold text-foreground">TTR GESTION</span>
        </LoadingLink>
        <nav className="hidden md:flex flex-1 justify-center gap-6">
            <LoadingLink href="/mission" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Mission
            </LoadingLink>
            <LoadingLink href="/vision" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Vision
            </LoadingLink>
            <LoadingLink href="/support" className="text-sm font-medium text-foreground transition-colors">
              Support & FAQ
            </LoadingLink>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          {isClient && <Suspense fallback={<div className="w-10 h-10" />}><ThemeToggle /></Suspense>}
          <div className="hidden md:flex">
            <Button asChild>
              <LoadingLink href="/login">Connexion</LoadingLink>
            </Button>
          </div>
          {isClient && <Sheet>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="md:hidden">
                <Menu className="h-6 w-6" />
                <span className="sr-only">Ouvrir le menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <div className="flex flex-col gap-6 p-6">
                <LoadingLink href="/" className="flex items-center gap-2">
                  <Icons.logo className="h-8 w-auto" />
                  <span className="font-semibold">TTR GESTION</span>
                </LoadingLink>
                <nav className="flex flex-col gap-4">
                  <SheetClose asChild><LoadingLink href="/mission" className="text-lg font-medium">Mission</LoadingLink></SheetClose>
                  <SheetClose asChild><LoadingLink href="/vision" className="text-lg font-medium">Vision</LoadingLink></SheetClose>
                  <SheetClose asChild><LoadingLink href="/support" className="text-lg font-medium">Support & FAQ</LoadingLink></SheetClose>
                </nav>
                <SheetClose asChild>
                  <Button asChild className="w-full"><LoadingLink href="/login">Connexion</LoadingLink></Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>}
        </div>
      </header>
      <PromotionalBanner />

      <main className="flex-1">
        <section className="w-full py-20 md:py-32">
            <div className="container px-4 md:px-6 max-w-4xl mx-auto">
              <h1 className="text-4xl font-bold tracking-tighter text-center sm:text-5xl text-primary mb-12">
                Support & Contact
              </h1>

              <Card>
                <CardHeader>
                    <CardTitle>Contactez-nous</CardTitle>
                    <CardDescription>
                        Utilisez ce formulaire pour toute question ou demande de support.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {isUserLoading ? (
                        <div className="flex justify-center items-center h-40">
                            <LoadingIndicator />
                        </div>
                    ) : user ? (
                        <form action={formAction} className="space-y-4">
                            <input type="hidden" name="userId" value={user.uid} />
                            <input type="hidden" name="name" value={user.displayName || 'N/A'} />
                            <input type="hidden" name="email" value={user.email || 'N/A'} />
                            
                            <div className="space-y-2">
                                <Label htmlFor="subject">Sujet</Label>
                                <Input id="subject" name="subject" placeholder="Ex: Problème avec mon code promo" required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="message">Message</Label>
                                <Textarea id="message" name="message" placeholder="Décrivez votre problème ou question ici..." required rows={5} />
                            </div>

                            {state?.success && (
                              <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
                                <CheckCircle className="h-4 w-4 !text-green-800" />
                                <AlertTitle>Message envoyé</AlertTitle>
                                <AlertDescription>{state.success}</AlertDescription>
                              </Alert>
                            )}

                            {state?.error && (
                              <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4" />
                                <AlertTitle>Erreur</AlertTitle>
                                <AlertDescription>{state.error}</AlertDescription>
                              </Alert>
                            )}

                            <SubmitButton />
                        </form>
                    ) : (
                        <div className="text-center p-8 border-2 border-dashed rounded-lg">
                            <h3 className="text-lg font-semibold mb-2">Accès réservé</h3>
                            <p className="text-muted-foreground mb-4">
                                Pour contacter le support, vous devez être connecté à votre compte ambassadeur.
                            </p>
                            <div className="flex gap-4 justify-center">
                                <Button asChild>
                                    <LoadingLink href="/login"><LogIn className="mr-2"/> Se connecter</LoadingLink>
                                </Button>
                                <Button asChild variant="secondary">
                                    <LoadingLink href="/login"><UserPlus className="mr-2"/> Créer un compte</LoadingLink>
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
              </Card>

              <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl text-primary mt-20 mb-12">
                Questions Fréquemment Posées
              </h2>
              <Accordion type="single" collapsible className="w-full">
                {faqItems.map((item, index) => (
                  <AccordionItem key={index} value={`item-${index}`}>
                    <AccordionTrigger className="text-lg font-semibold text-left hover:no-underline">{item.question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground pt-2 text-base">
                      {item.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
        </section>
      </main>

      <footer className="flex flex-col gap-2 sm:flex-row py-6 w-full shrink-0 items-center px-4 md:px-6 border-t bg-transparent">
        <p className="text-xs text-muted-foreground">
          &copy; 2024 TTR Gestion. Tous droits réservés.
        </p>
        <nav className="sm:ml-auto flex gap-4 sm:gap-6">
          <LoadingLink href="/politique-et-conditions" className="text-xs hover:underline underline-offset-4 text-muted-foreground">
            Politique & Conditions
          </LoadingLink>
          <LoadingLink href="/monoyi" className="text-xs hover:underline underline-offset-4 text-muted-foreground">
            Monoyi
          </LoadingLink>
        </nav>
      </footer>
    </div>
  );
}
