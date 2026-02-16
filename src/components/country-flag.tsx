
'use client';

import { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';

export default function CountryFlag() {
  const [countryCode, setCountryCode] = useState<string | null>(null);

  useEffect(() => {
    // This code runs only on the client
    if (typeof navigator !== 'undefined') {
      const lang = navigator.language; // e.g., "en-US", "fr-FR", "fr-TG"
      const region = lang.split('-')[1]?.toLowerCase();
      if (region) {
        setCountryCode(region);
      } else {
        // Fallback for languages without region code (e.g., "fr")
        // You can map common languages to default countries
        const langOnly = lang.split('-')[0];
        const langMap: { [key: string]: string } = {
          fr: 'fr',
          en: 'gb',
        };
        setCountryCode(langMap[langOnly] || null);
      }
    }
  }, []);

  if (!countryCode) {
    return null; // Don't render anything if we can't determine the country
  }

  return (
    <div className="flex items-center" title={`Pays détecté : ${countryCode.toUpperCase()}`}>
        <span className={cn('fi', `fi-${countryCode}`, 'text-lg')}></span>
    </div>
  );
}
