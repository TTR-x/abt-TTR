'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Icons } from '@/components/icons';
import { Menu, ArrowRight } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import PromotionalBanner from '@/components/promotional-banner';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetClose,
} from '@/components/ui/sheet';
import LoadingLink from '@/components/loading-link';
import dynamic from 'next/dynamic';
import { Suspense, useState, useEffect } from 'react';
import { MonoyiIcon } from '@/components/icons/monoyi-icon';
import { useInView } from 'react-intersection-observer';

const ThemeToggle = dynamic(
  () => import('@/components/theme-toggle').then((mod) => mod.ThemeToggle),
  {
    ssr: false,
    loading: () => <div className="w-10 h-10" />,
  }
);

function CashCounter({ targetValue }: { targetValue: number }) {
    const [count, setCount] = useState(0);
    const { ref, inView } = useInView({
        triggerOnce: true,
        threshold: 0.5,
    });

    useEffect(() => {
        if (inView) {
            let start = 0;
            const end = targetValue;
            if (start === end) return;

            const duration = 1500; // 1.5 seconds
            const incrementTime = (duration / end) / 2;
            
            const timer = setInterval(() => {
                start += 1;
                setCount(start);
                if (start === end) clearInterval(timer);
            }, incrementTime);

            return () => clearInterval(timer);
        }
    }, [inView, targetValue]);

    return (
        <div ref={ref} className="text-4xl md:text-5xl font-bold text-green-500">
            {count.toLocaleString('fr-FR')} FCFA
        </div>
    );
}

export default function MonoyiPage() {
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
          <LoadingLink
            href="/mission"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Mission
          </LoadingLink>
          <LoadingLink
            href="/vision"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            Vision
          </LoadingLink>
          <LoadingLink
            href="/support"
            className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
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
                    <LoadingLink href="/mission" className="text-lg font-medium">
                      Mission
                    </LoadingLink>
                  </SheetClose>
                  <SheetClose asChild>
                    <LoadingLink href="/vision" className="text-lg font-medium">
                      Vision
                    </LoadingLink>
                  </SheetClose>
                  <SheetClose asChild>
                    <LoadingLink href="/support" className="text-lg font-medium">
                      Support & FAQ
                    </LoadingLink>
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
              <MonoyiIcon className="h-24 w-24 text-primary mx-auto mb-4 animate-pulse" />
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl text-primary font-headline">
                Découvrez le Monoyi (MYI)
              </h1>
              <p className="mt-4 text-muted-foreground md:text-xl">
                La monnaie de votre succès dans l'écosystème TTR Groupe.
              </p>
            </div>

            <div className="space-y-8">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-primary">
                  Qu'est-ce que le Monoyi ?
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  Le Monoyi (MYI) est l'unité de valeur et de récompense utilisée
                  à travers tout l'écosystème de TTR Groupe. Ce n'est pas une cryptomonnaie, mais un point de
                  valeur qui représente votre contribution et votre succès. Chaque Monoyi
                  que vous gagnez a une valeur réelle et peut être converti en argent ou utilisé pour des services au sein du groupe.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-8 items-center">
                <Card className="bg-secondary/50">
                  <CardHeader>
                    <CardTitle>Comment ça fonctionne ?</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4 text-muted-foreground">
                    <p>
                      <strong>1. Gagnez des Monoyi :</strong> Vous en recevez pour chaque client actif parrainé ou en accomplissant des tâches au sein de l'écosystème TTR Groupe. Votre niveau d'ambassadeur peut augmenter vos gains.
                    </p>
                    <p>
                      <strong>2. Accumulez vos gains :</strong> Vos Monoyi
                      s'accumulent dans votre solde, visible en temps réel sur
                      votre tableau de bord.
                    </p>
                    <p>
                      <strong>3. Convertissez en argent :</strong> Une fois que
                      vous atteignez le seuil minimum, vous pouvez demander un
                      retrait pour convertir vos Monoyi en FCFA.
                    </p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>La valeur du Monoyi</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-center p-6 rounded-lg bg-background border">
                      <p className="text-lg text-muted-foreground">
                        Taux de conversion
                      </p>
                      <div className="text-4xl font-bold text-primary my-2 flex items-center justify-center gap-3">
                         1 <MonoyiIcon className="h-8 w-8"/> = <CashCounter targetValue={800} />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Ce taux est fixe et transparent.
                      </p>
                    </div>
                    <div className="text-center p-6 rounded-lg bg-background border">
                      <p className="text-lg text-muted-foreground">
                        Retrait minimum
                      </p>
                      <p className="text-4xl font-bold text-primary my-2">
                        5 MYI
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Soit 4 000 FCFA.
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="text-center pt-8">
                <h3 className="text-2xl font-bold text-primary mb-4">
                  Prêt à accumuler des Monoyi ?
                </h3>
                <p className="text-muted-foreground mb-6 max-w-2xl mx-auto">
                  Devenez ambassadeur et commencez à transformer votre
                  influence en une récompense concrète.
                </p>
                <Button asChild size="lg">
                  <LoadingLink href="/login">
                    Commencer maintenant{' '}
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </LoadingLink>
                </Button>
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
          <LoadingLink
            href="/politique-et-conditions"
            className="text-xs hover:underline underline-offset-4 text-muted-foreground"
          >
            Politique & Conditions
          </LoadingLink>
          <LoadingLink
            href="/monoyi"
            className="text-xs hover:underline underline-offset-4 text-muted-foreground"
          >
            Monoyi
          </LoadingLink>
        </nav>
      </footer>
    </div>
  );
}
