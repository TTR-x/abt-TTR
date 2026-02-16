'use client';

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Menu } from "lucide-react";
import PromotionalBanner from "@/components/promotional-banner";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import LoadingLink from "@/components/loading-link";
import dynamic from 'next/dynamic';
import { Suspense, useState, useEffect } from 'react';

const ThemeToggle = dynamic(() => import('@/components/theme-toggle').then(mod => mod.ThemeToggle), {
  ssr: false,
  loading: () => <div className="w-10 h-10" />
});

export default function PolicyPage() {
  const [isClient, setIsClient] = useState(false)
 
  useEffect(() => {
    setIsClient(true)
  }, [])
  
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
            <LoadingLink href="/support" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Support & FAQ
            </LoadingLink>
        </nav>
        <div className="ml-auto flex items-center gap-4">
          
          {isClient && <Suspense fallback={<div className="w-10 h-10" />}>
            <ThemeToggle />
          </Suspense>}
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
                  <SheetClose asChild>
                    <LoadingLink href="/mission" className="text-lg font-medium">Mission</LoadingLink>
                  </SheetClose>
                  <SheetClose asChild>
                    <LoadingLink href="/vision" className="text-lg font-medium">Vision</LoadingLink>
                  </SheetClose>
                  <SheetClose asChild>
                    <LoadingLink href="/support" className="text-lg font-medium">Support & FAQ</LoadingLink>
                  </SheetClose>
                </nav>
                <SheetClose asChild>
                  <Button asChild className="w-full">
                    <LoadingLink href="/login">Connexion</LoadingLink>
                  </Button>
                </SheetClose>
              </div>
            </SheetContent>
          </Sheet>}
        </div>
      </header>
      <PromotionalBanner />

      <main className="flex-1">
        <section className="w-full py-20 md:py-32">
          <div className="container px-4 md:px-6 max-w-4xl mx-auto space-y-12">
            <div className="text-center">
                <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl text-primary font-headline">
                    Politique de Confidentialité et Conditions d'Utilisation
                </h1>
                <p className="mt-4 text-muted-foreground md:text-xl">
                    Dernière mise à jour : 26 Juillet 2024
                </p>
            </div>

            <div className="space-y-8">
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-primary">1. Introduction</h2>
                    <p className="text-muted-foreground">Bienvenue dans le programme Ambassadeur de TTR Gestion. En vous inscrivant, vous acceptez de respecter les présentes conditions d'utilisation. Ce document régit votre participation en tant qu'ambassadeur et définit vos droits et responsabilités.</p>
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-primary">2. Inscription et Compte</h2>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Vous devez fournir des informations exactes et complètes lors de votre inscription.</li>
                        <li>Vous êtes responsable de la sécurité de votre compte et de votre mot de passe.</li>
                        <li>L'usurpation d'identité ou la fourniture de fausses informations entraînera la suspension immédiate et définitive de votre compte.</li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-primary">3. Rôle et Responsabilités de l'Ambassadeur</h2>
                     <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Votre mission est de promouvoir l'application TTRGESTION de manière honnête et professionnelle.</li>
                        <li>Vous ne devez pas faire de fausses promesses ou utiliser des méthodes de marketing trompeuses (spam, publicité mensongère, etc.).</li>
                        <li>Vous devez représenter la marque TTR Gestion de manière positive et éthique.</li>
                        <li>Toute tentative de fraude, y compris la création de faux comptes ou l'auto-parrainage abusif, est strictement interdite.</li>
                    </ul>
                </div>
                
                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-primary">4. Commissions et Paiements</h2>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Les commissions sont gagnées uniquement lorsque les clients que vous avez référés deviennent des utilisateurs actifs (abonnés payants) de TTRGESTION.</li>
                        <li>Le taux de conversion des points en monnaie locale est spécifié dans votre tableau de bord et peut être sujet à des modifications.</li>
                        <li>Un seuil de retrait minimum est en place. Vous ne pouvez demander un paiement que si votre solde de points atteint ce seuil.</li>
                        <li>Les paiements sont traités dans les délais indiqués, mais TTR Gestion ne peut être tenu responsable des retards causés par les prestataires de paiement.</li>
                    </ul>
                </div>
                
                 <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-primary">5. Collecte et Utilisation des Données</h2>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>Nous collectons les informations que vous fournissez à l'inscription (nom, email, etc.) pour gérer votre compte.</li>
                        <li>Les informations de vérification (nom complet, numéro, localisation) sont utilisées uniquement pour sécuriser la plateforme et prévenir la fraude. Elles ne sont pas partagées avec des tiers.</li>
                        <li>Nous utilisons des cookies et des technologies similaires pour assurer le bon fonctionnement du site et suivre les parrainages.</li>
                    </ul>
                </div>

                <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-primary">6. Suspension et Résiliation</h2>
                    <ul className="list-disc list-inside space-y-2 text-muted-foreground">
                        <li>TTR Gestion se réserve le droit de suspendre ou de résilier définitivement votre compte si vous violez l'une de ces conditions.</li>
                        <li>Un ambassadeur n'ayant enregistré aucun nouveau client actif pendant une période de 14 jours verra son compte suspendu pour inactivité. La réactivation du compte nécessitera le paiement de frais de 1000 FCFA.</li>
                        <li>En cas de résiliation pour fraude ou violation grave, tous les points et commissions non payés seront perdus.</li>
                    </ul>
                </div>
                
                 <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-primary">7. Modifications des Conditions</h2>
                    <p className="text-muted-foreground">Nous nous réservons le droit de modifier ces conditions à tout moment. Les ambassadeurs seront informés des changements importants. La poursuite de votre participation au programme après une modification constitue une acceptation des nouvelles conditions.</p>
                </div>

                 <div className="space-y-4">
                    <h2 className="text-2xl font-bold text-primary">8. Contact</h2>
                    <p className="text-muted-foreground">Pour toute question concernant cette politique, veuillez nous contacter via la page de support.</p>
                </div>
            </div>
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
