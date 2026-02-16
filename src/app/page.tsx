'use client';

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { ArrowRight, Target, TrendingUp, Handshake, Menu, GraduationCap, Store, Megaphone, Briefcase, DollarSign, PenSquare, UserPlus, PlayCircle, Banknote, Award, Star, Gem, Zap } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import AnimatedHeadline from "@/components/animated-headline";
import PromotionalBanner from "@/components/promotional-banner";
import { Sheet, SheetContent, SheetTrigger, SheetClose } from "@/components/ui/sheet";
import LoadingLink from "@/components/loading-link";
import { MonoyiIcon } from "@/components/icons/monoyi-icon";
import dynamic from 'next/dynamic';
import { Suspense, useState, useEffect } from 'react';

const ThemeToggle = dynamic(() => import('@/components/theme-toggle').then(mod => mod.ThemeToggle), {
  ssr: false,
  loading: () => <div className="w-10 h-10" />
});

export default function LandingPage() {
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

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
    { name: "Seychelles", code: "sc" },
    { name: "Comores", code: "km" },
    { name: "Égypte", code: "eg" },
    { name: "Nigéria", code: "ng" },
    { name: "Ghana", code: "gh" },
    { name: "France", code: "fr" },
    { name: "Belgique", code: "be" },
    { name: "Suisse", code: "ch" },
    { name: "Allemagne", code: "de" },
  ];

  const whoCanUse = [
    {
      icon: <GraduationCap className="h-10 w-10 text-primary" />,
      title: "Étudiants",
      description: "Générez un revenu pendant vos études avec un travail en ligne flexible et adapté à votre emploi du temps."
    },
    {
      icon: <Store className="h-10 w-10 text-primary" />,
      title: "Commerçants & Entrepreneurs",
      description: "Recommandez un outil que vous aimez et créez une nouvelle source de revenus pour votre activité."
    },
    {
      icon: <Megaphone className="h-10 w-10 text-primary" />,
      title: "Professionnels du Marketing",
      description: "Mettez vos compétences en marketing d'affiliation à profit et gagnez des commissions attractives."
    },
    {
      icon: <Briefcase className="h-10 w-10 text-primary" />,
      title: "Freelances & Indépendants",
      description: "Diversifiez vos sources de revenus en intégrant notre programme à votre offre de services."
    },
    {
      icon: <PenSquare className="h-10 w-10 text-primary" />,
      title: "Créateurs de Contenu",
      description: "Monétisez votre audience en partageant une solution utile et pertinente avec votre communauté."
    },
    {
      icon: <DollarSign className="h-10 w-10 text-primary" />,
      title: "Toute personne motivée",
      description: "Si vous êtes ambitieux et cherchez une opportunité de travail à domicile, ce programme est pour vous."
    }
  ];

  const howToWinSteps = [
    {
      icon: <UserPlus className="h-8 w-8 text-primary" />,
      title: "1. Créez votre compte",
      description: "L'inscription est rapide, gratuite et vous donne un accès immédiat à votre tableau de bord."
    },
    {
      icon: <PlayCircle className="h-8 w-8 text-primary" />,
      title: "2. Suivez la vidéo d'apprentissage",
      description: "Une courte formation vous explique tout ce que vous devez savoir pour réussir."
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "3. Promouvoir TTR Gestion",
      description: "Partagez votre lien et visez 10 clients actifs pour débloquer le Niveau 1 et plus de revenus."
    },
    {
      icon: <Banknote className="h-8 w-8 text-primary" />,
      title: "4. Retirez vos gains",
      description: "Demandez un paiement dès 5 Monoyi (4 000 FCFA). Votre argent est traité en moins de 24h."
    }
  ];

  const levels = [
    {
      name: "Niveau 1",
      icon: <Award className="text-orange-400" />,
      commissionInscription: 100, // FCFA fixe par inscription
      commissionParticulier: 150, // 10% de 1500F
      commissionEntreprise: 480, // 10% de 4800F
      commissionService: "10%", // Sur services
      clientsRequis: "0-9 Clients"
    },
    {
      name: "Niveau 2",
      icon: <Star className="text-gray-400" />,
      commissionInscription: 100,
      commissionParticulier: 300, // 20% de 1500F
      commissionEntreprise: 960, // 20% de 4800F
      commissionService: "20%",
      clientsRequis: "10-49 Clients"
    },
    {
      name: "Niveau 3",
      icon: <Gem className="text-yellow-400" />,
      commissionInscription: 100,
      commissionParticulier: 375, // 25% de 1500F
      commissionEntreprise: 1200, // 25% de 4800F
      commissionService: "25%",
      clientsRequis: "50-99 Clients"
    },
    {
      name: "Niveau 4",
      icon: <Zap className="text-blue-400" />,
      commissionInscription: 100,
      commissionParticulier: 525, // 35% de 1500F
      commissionEntreprise: 1680, // 35% de 4800F
      commissionService: "jusqu'à 50%",
      clientsRequis: "100+ Clients"
    },
  ];

  const monoyiToCfa = (monoyi: number) => {
    return Math.round(monoyi * 800);
  };


  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-50 px-4 lg:px-6 h-16 flex items-center bg-background/30 backdrop-blur-sm shadow-sm">
        <LoadingLink href="/" className="flex items-center justify-center gap-2">
          <Icons.logo className="h-8 w-auto" />
          <span className="font-semibold text-foreground">Ambassadeur TTR</span>
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
                  <span className="font-semibold">Ambassadeur TTR</span>
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

      <div className="flex-1">
        <section className="w-full h-screen flex items-center justify-center text-center -mt-16 relative">
          <Image
            src="/fond.png"
            alt="Arrière-plan représentant des entrepreneurs africains"
            fill
            className="object-cover z-0"
            data-ai-hint="african entrepreneurs"
            priority
          />
          <div className="absolute inset-0 bg-black/60 z-10" />
          <div className="container px-4 md:px-6 relative z-20">
            <div className="flex flex-col items-center space-y-8 h-48 justify-center">
              <AnimatedHeadline />
              <div className="flex flex-col items-center gap-4">
                <Button asChild size="lg">
                  <LoadingLink href="/login">Commence maintenant <ArrowRight className="ml-2 h-5 w-5" /></LoadingLink>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <main className="py-12 md:py-24 lg:py-32">
          <div className="container px-4 md:px-6 grid gap-8 lg:grid-cols-2 lg:gap-12 items-center">
            <div className="space-y-4">
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-primary">Devenez ambassadeur. Gagnez de l'argent en ligne.</h2>
              <p className="text-muted-foreground md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
                Rejoignez notre programme d'ambassadeurs TTR Gestion et commencez à transformer votre réseau en une source de revenus. Que vous cherchiez un complément de salaire, un travail à domicile, ou une nouvelle opportunité de business, nous vous fournissons les outils et le soutien nécessaires pour réussir.
              </p>
              <div className="relative mt-6 aspect-[4/3] rounded-xl overflow-hidden">
                <Image
                  src="/foto2.png"
                  alt="Un ambassadeur TTR Gestion présentant l'application"
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  data-ai-hint="man presenting app"
                />
              </div>
            </div>
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target />
                    Votre mission : la promotion
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Invitez des commerçants et entrepreneurs à découvrir TTR Gestion. Chaque nouvelle inscription via votre code promo vous rapproche de vos objectifs financiers et vous permet de gagner de l'argent en ligne.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp />
                    Vos revenus : des commissions attractives
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Générez des commissions pour chaque client qui devient actif. Plus vous parrainez de monde, plus vous gagnez. Une véritable opportunité de travail en ligne avec un potentiel de revenu passif.</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Handshake />
                    Notre partenariat gagnant-gagnant
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">Nous croyons en une collaboration transparente. Bénéficiez d'un tableau de bord complet pour suivre vos performances, vos gains et votre évolution dans notre programme d'affiliation.</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl text-primary mb-12">
              Qui peut devenir ambassadeur ?
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              {whoCanUse.map((item, index) => (
                <Card key={index} className="text-center">
                  <CardContent className="p-6 flex flex-col items-center gap-4">
                    {item.icon}
                    <h3 className="text-xl font-bold">{item.title}</h3>
                    <p className="text-muted-foreground">{item.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24 bg-secondary">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl text-primary mb-12">
              Comment gagner avec nous ?
            </h2>
            <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {howToWinSteps.map((step) => (
                <Card key={step.title} className="text-center border-0 bg-transparent shadow-none">
                  <CardContent className="p-6 flex flex-col items-center gap-4">
                    {step.icon}
                    <h3 className="text-xl font-bold">{step.title}</h3>
                    <p className="text-muted-foreground">{step.description}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6 text-center">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl text-primary mb-8">
              Suivez notre formation vidéo
            </h2>
            <div className="max-w-4xl mx-auto">
              <Card className="overflow-hidden group">
                <div className="relative aspect-video">
                  <Image
                    src="https://picsum.photos/seed/trainingvideo/1280/720"
                    alt="Vidéo de formation TTR Gestion"
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    data-ai-hint="video thumbnail"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <PlayCircle className="h-20 w-20 text-white/80 transform transition-transform duration-300 group-hover:scale-110" />
                  </div>
                </div>
              </Card>
            </div>
            <div className="max-w-4xl mx-auto mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {Array.from({ length: 5 }).map((_, index) => (
                <Card key={index} className="overflow-hidden group">
                  <div className="relative aspect-video">
                    <Image
                      src={`https://picsum.photos/seed/smallvideo${index + 1}/300/200`}
                      alt={`Vidéo de formation ${index + 1}`}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      data-ai-hint="training video"
                    />
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <PlayCircle className="h-10 w-10 text-white/80 transition-transform duration-300 group-hover:scale-110" />
                    </div>
                  </div>
                </Card>
              ))}
            </div>
            <Button asChild size="lg" className="mt-8">
              <LoadingLink href="/mission">Découvrir la mission en détail <ArrowRight className="ml-2 h-5 w-5" /></LoadingLink>
            </Button>
          </div>
        </section>

        <section className="py-12 md:py-24 bg-secondary">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl text-primary mb-12">
              Combien je gagne exactement ?
            </h2>
            <p className="text-center text-muted-foreground max-w-3xl mx-auto mb-12">
              Gagnez sur 3 niveaux : <span className="font-semibold text-foreground">100 FCFA par inscription</span>, puis des commissions de <span className="font-semibold text-foreground">10% à 35%</span> sur les forfaits premium, et jusqu'à <span className="font-semibold text-foreground">50% sur les services</span>. Plus vous progressez, plus vous gagnez !
            </p>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              {levels.map((level) => (
                <Card key={level.name} className="flex flex-col">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      {level.icon} {level.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground font-semibold">{level.clientsRequis}</p>
                  </CardHeader>
                  <CardContent className="flex-grow space-y-3">
                    <div className="text-center p-4 rounded-lg bg-background border">
                      <p className="text-xs text-muted-foreground">Par inscription</p>
                      <p className="text-2xl font-bold text-primary">{level.commissionInscription} FCFA</p>
                      <p className="text-xs text-muted-foreground">Dès qu'un client s'inscrit</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-background border">
                      <p className="text-xs text-muted-foreground">Forfait Particulier</p>
                      <p className="text-2xl font-bold text-primary">{level.commissionParticulier.toLocaleString('fr-FR')} FCFA</p>
                      <p className="text-xs text-muted-foreground">Si souscription à 1 500F</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-background border">
                      <p className="text-xs text-muted-foreground">Forfait Entreprise</p>
                      <p className="text-2xl font-bold text-primary">{level.commissionEntreprise.toLocaleString('fr-FR')} FCFA</p>
                      <p className="text-xs text-muted-foreground">Si souscription à 4 800F</p>
                    </div>
                    <div className="text-center p-4 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/20">
                      <p className="text-xs text-muted-foreground font-semibold">Commission Services</p>
                      <p className="text-3xl font-bold text-primary">{level.commissionService}</p>
                      <p className="text-xs text-muted-foreground">Sur services (1 000F - 50 000F)</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
            <Card className="mt-8 max-w-3xl mx-auto border-dashed bg-transparent">
              <CardContent className="p-6">
                <p className="text-sm text-center text-muted-foreground mb-4">
                  <span className="font-semibold text-foreground">💡 Comment ça marche ?</span>
                </p>
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div className="text-center">
                    <p className="font-semibold text-foreground">1️⃣ Inscription</p>
                    <p className="text-muted-foreground">100 FCFA dès qu'un client s'inscrit</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground">2️⃣ Forfait Premium</p>
                    <p className="text-muted-foreground">10% à 35% si souscription</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground">3️⃣ Services</p>
                    <p className="text-muted-foreground">Jusqu'à 50% de commission</p>
                  </div>
                </div>
                <p className="text-xs text-center text-muted-foreground mt-4">
                  Retrait minimum : <span className="font-semibold text-foreground">4 000 FCFA</span>
                </p>
              </CardContent>
            </Card>
            <div className="text-center mt-8">
              <Button asChild size="lg">
                <LoadingLink href="/login">Commencer à gagner <ArrowRight className="ml-2 h-5 w-5" /></LoadingLink>
              </Button>
            </div>
          </div>
        </section>

        <section className="py-12 md:py-24">
          <div className="container px-4 md:px-6">
            <h2 className="text-3xl font-bold tracking-tighter text-center sm:text-4xl text-primary mb-12">
              Une opportunité de travail en ligne disponible dans plusieurs pays
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-8">
              {countries.map((country) => (
                <div key={country.name} className="flex flex-col items-center gap-2">
                  <span className={`fi fi-${country.code} text-5xl`}></span>
                  <span className="text-sm font-medium text-muted-foreground">{country.name}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

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
