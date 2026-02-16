
'use client';

import { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export default function PromotionalBanner() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // On the server, we can't know if it was closed, so we don't render it initially.
    // On the client, we check localStorage and then show it if needed.
    const isBannerClosed = localStorage.getItem('isBannerClosed');
    if (isBannerClosed !== 'true') {
      setIsVisible(true);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    try {
        localStorage.setItem('isBannerClosed', 'true');
    } catch (error) {
        console.error("Could not access localStorage.", error);
    }
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="sticky top-16 z-40 bg-primary text-primary-foreground">
      <div className="relative mx-auto flex h-10 items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex-1 text-center font-semibold text-sm uppercase">
          <span>Gagnez plus de 5000 FCFA par jour / 150.000 FCFA par mois</span>
        </div>
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
            <button 
                onClick={handleClose} 
                className="flex items-center justify-center rounded-md p-1 text-primary-foreground/70 transition-colors hover:bg-primary-foreground/10 hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-white"
                aria-label="Fermer la bannière"
            >
                <X className="h-5 w-5" />
            </button>
        </div>
      </div>
    </div>
  );
}
