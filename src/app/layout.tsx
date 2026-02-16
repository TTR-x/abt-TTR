
'use client';

import './globals.css';
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from '@/components/theme-provider';
import { FirebaseClientProvider } from '@/firebase';
import { LoadingProvider, useLoading } from '@/context/loading-provider';
import { LoadingIndicator } from '@/components/ui/loading-indicator';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, Suspense } from 'react';

function GlobalLoadingIndicator() {
  const { isLoading, setIsLoading } = useLoading();
  const pathname = usePathname();
  const indicatorRef = useRef<HTMLDivElement>(null);

  // Turn off loading indicator if the user navigates back/forward
  useEffect(() => {
    setIsLoading(false);
  }, [pathname, setIsLoading]);

  // Force browser reflow to ensure the indicator shows up immediately
  useEffect(() => {
    if (isLoading && indicatorRef.current) {
      // Reading a dimension property forces the browser to repaint
      void indicatorRef.current.offsetWidth;
    }
  }, [isLoading]);

  if (!isLoading) return null;

  return (
    <div ref={indicatorRef} className="fixed inset-0 z-[999] flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <LoadingIndicator />
    </div>
  );
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <title>Ambassadeur TTR - Gagnez de l'Argent en Ligne | Programme Ambassadeur</title>
        <meta name="description" content="Rejoignez le programme Ambassadeur TTR et commencez à gagner de l'argent en ligne. Transformez votre réseau en revenus en faisant la promotion de notre application de gestion. Idéal pour un complément de revenu, un travail à domicile ou une nouvelle carrière dans le marketing d'affiliation." />
        <meta name="keywords" content="TTR Gestion, gagner de l'argent en ligne, travail en ligne, travail à domicile, revenu passif, complément de revenu, affiliation, marketing d'affiliation, devenir ambassadeur, programme de parrainage, entrepreneuriat, Afrique, Lomé, Togo" />
        <meta name="google-site-verification" content="djLBD9J-mg8N9y3C-8aHUwtPCWAQBQkRzAy4vTGb1Ss" />
        <meta name="theme-color" content="#182A59" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet" />
        <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/lipis/flag-icons@7/css/flag-icons.min.css" />
      </head>
      <body className="font-body antialiased">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
        >
          <FirebaseClientProvider>
            <LoadingProvider>
              <GlobalLoadingIndicator />
              <Suspense fallback={<GlobalLoadingIndicator />}>
                {children}
              </Suspense>
            </LoadingProvider>
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
