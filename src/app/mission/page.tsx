'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { ArrowRight, UserPlus, Share2, Target, BarChart, Award, Menu } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import PromotionalBanner from "@/components/promotional-banner";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import LoadingLink from "@/components/loading-link";
import dynamic from 'next/dynamic';
import { Suspense, useState, useEffect } from 'react';

const ThemeToggle = dynamic(() => import('@/components/theme-toggle').then(mod => mod.ThemeToggle), {
  ssr: false,
  loading: () => <div className="w-10 h-10" />
});

export default function MissionPage() {
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
            <LoadingLink href="/mission" className="text-sm font-medium text-foreground transition-colors">
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
        <section className="w-full py-20 md:py-32 lg:py-40 relative">
          <div className="container px-4 md:px-6 relative z-20 text-center">
            <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl text-primary font-headline">
              Votre Mission : Gagner de l'Argent en Ligne
            </h1>
            <p className="mt-4 max-w-3xl mx-auto text-muted-foreground md:text-xl">
              Devenir ambassadeur TTR Gestion, c'est choisir un travail en ligne flexible et rémunérateur. Voici votre parcours pour générer des revenus en tant que partenaire.
            </p>
          </div>
        </section>

        <section className="py-12 md:py-24">
            <div className="container px-4 md:px-6 grid gap-8">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-3">
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <UserPlus className="text-primary" />
                                1. Inscription Facile
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Votre aventure pour gagner de l'argent en ligne commence ici. L'inscription est rapide et vous donne accès à votre tableau de bord personnel avec votre code promo unique, l'outil clé de votre futur succès.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <Share2 className="text-primary" />
                                2. Promotion Intelligente
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Votre mission principale est de faire connaître TTR Gestion. Partagez votre code promo sur les réseaux sociaux, blogs, ou avec votre réseau. C'est l'essence de ce travail en ligne : être créatif et authentique pour attirer des clients.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <Target className="text-primary" />
                                3. Suivi des Performances
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Suivez en temps réel l'impact de votre promotion. Votre tableau de bord vous montre les inscriptions et les clients actifs, vous permettant de mesurer l'efficacité de vos actions marketing et d'ajuster votre stratégie.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <BarChart className="text-primary" />
                                4. Commissions et Revenus
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Chaque fois qu'un de vos filleuls s'abonne, vous gagnez une commission. C'est la concrétisation de votre travail : transformer votre influence en revenus. Votre tableau de bord affiche vos gains en toute transparence.</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3">
                                <Award className="text-primary" />
                                5. Évolution et Bonus
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Votre performance est récompensée. En accumulant des clients actifs, vous grimpez les niveaux d'ambassadeur, ce qui débloque des commissions plus élevées et des avantages exclusifs. Plus vous êtes performant, plus vous gagnez.</p>
                        </CardContent>
                    </Card>
                     <Card className="bg-primary/10 border-primary/20 flex flex-col justify-center items-center text-center p-6">
                        <h3 className="text-xl font-bold text-primary">Prêt à travailler en ligne ?</h3>
                        <p className="text-muted-foreground mt-2 mb-4">Rejoignez-nous aujourd'hui et commencez à construire votre succès et à gagner de l'argent avec nous.</p>
                        <Button asChild>
                            <LoadingLink href="/login">Devenir Ambassadeur <ArrowRight className="ml-2 h-5 w-5" /></LoadingLink>
                        </Button>
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
