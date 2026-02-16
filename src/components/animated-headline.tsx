
'use client';

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const headlines = [
  "Gagner de l’argent en ligne, c’est possible. Et ça commence ici.",
  "Transformez votre réseau en une source de revenus durable.",
  "Devenez ambassadeur. Prenez votre indépendance financière.",
];

export default function AnimatedHeadline() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFading, setIsFading] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsFading(true);
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % headlines.length);
        setIsFading(false);
      }, 1000); // Duration of the fade-out animation
    }, 5000); // Change text every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <h1
      className={cn(
        "text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl xl:text-7xl/none font-headline drop-shadow-lg transition-opacity duration-1000 text-white",
        isFading ? 'opacity-0' : 'opacity-100'
      )}
    >
      {headlines[currentIndex]}
    </h1>
  );
}
