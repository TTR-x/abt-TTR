'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Card, CardContent } from "@/components/ui/card";
import PromotionalBanner from "@/components/promotional-banner";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import LoadingLink from "@/components/loading-link";
import dynamic from 'next/dynamic';
import { Suspense, useState, useEffect } from 'react';

const ThemeToggle = dynamic(() => import('@/components/theme-toggle').then(mod => mod.ThemeToggle), {
  ssr: false,
  loading: () => <div className="w-10 h-10" />
});

export default function VisionPage() {
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
            <LoadingLink href="/vision" className="text-sm font-medium text-foreground transition-colors">
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
        <section className="w-full py-20 md:py-32 lg:py-40 relative">
          <div className="container px-4 md:px-6 relative z-20 text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-primary font-headline">
              Notre Vision : L'indépendance financière pour tous
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-muted-foreground md:text-xl">
              Donner à chacun la possibilité de gagner de l'argent en ligne et de participer à la révolution digitale, peu importe où vous êtes.
            </p>
          </div>
        </section>

        <section className="py-12 md:py-24">
            <div className="container px-4 md:px-6 grid gap-12">
              
              <div className="max-w-4xl mx-auto space-y-8">
                <div>
                  <h2 className="text-3xl font-bold tracking-tighter text-primary mb-4">La Mission de TTR GESTION</h2>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    TTRGESTION est une application mobile conçue pour les petits commerçants qui veulent mieux gérer leur activité sans se compliquer la vie. Notre objectif est de rendre la gestion d'entreprise accessible à tous.
                  </p>
                  <p className="mt-4 text-muted-foreground leading-relaxed">
                    Dans de nombreux marchés et boutiques, la gestion se fait encore sur papier. TTRGESTION résout ce problème avec une solution simple, locale et puissante. C'est en aidant ces entrepreneurs que nos ambassadeurs trouvent une opportunité de travail en ligne valorisante.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                  <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-primary mb-3">Ce que fait TTRGESTION</h3>
                      <ul className="space-y-3 text-muted-foreground list-disc list-inside">
                        <li>Fonctionne comme un cahier numérique intelligent.</li>
                        <li>Permet de noter chaque vente, dépense, et produit.</li>
                        <li>Calcule automatiquement le bénéfice net.</li>
                        <li>Garde un historique clair de toutes les transactions.</li>
                        <li>Aide à une meilleure gestion pour plus de revenus.</li>
                      </ul>
                    </CardContent>
                  </Card>
                   <Card>
                    <CardContent className="p-6">
                      <h3 className="text-xl font-semibold text-primary mb-3">Notre programme pour vous</h3>
                      <ul className="space-y-3 text-muted-foreground list-disc list-inside">
                        <li>Une opportunité de gagner de l'argent en ligne.</li>
                        <li>Un travail à domicile flexible et sans patron.</li>
                        <li>Un complément de revenu ou un revenu principal.</li>
                        <li>Un programme d'affiliation simple et transparent.</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>

                <div>
                  <h3 className="text-2xl font-bold tracking-tighter text-primary mb-4">Pourquoi ce programme existe ?</h3>
                  <div className="space-y-4 text-muted-foreground">
                    <p>Parce que nous croyons que tout le monde mérite une chance de réussir et de gagner de l'argent, peu importe son parcours.</p>
                    <p>Parce que la digitalisation ne doit pas être un luxe, mais une opportunité de travail en ligne accessible à tous.</p>
                    <p>Parce que le commerce local est le moteur de l'économie, et nous voulons que vous participiez à son succès tout en créant votre propre indépendance financière.</p>
                  </div>
                </div>

                <Card className="bg-primary/10 border-primary/20">
                  <CardContent className="p-8">
                    <blockquote className="text-center">
                      <h3 className="text-2xl font-semibold text-primary mb-4">Notre vision commune</h3>
                      <p className="text-xl text-foreground/90 italic leading-loose">
                        "Aider les commerçants à réussir, et vous permettre de gagner des revenus en participant à cette réussite. TTR Gestion transforme une application utile en une source de revenus pour vous. Elle transforme un ambassadeur en entrepreneur du web."
                      </p>
                    </blockquote>
                  </CardContent>
                </Card>

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
