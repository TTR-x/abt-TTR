'use client';

import { useEffect, useState } from 'react';

export default function DebugPage() {
    const [envVars, setEnvVars] = useState<Record<string, string | undefined>>({});

    useEffect(() => {
        setEnvVars({
            NEXT_PUBLIC_FIREBASE_API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
            NEXT_PUBLIC_FIREBASE_PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
            NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        });
    }, []);

    return (
        <div className="p-8 font-mono">
            <h1 className="text-xl font-bold mb-4">Debug Environnement Vercel</h1>
            <div className="space-y-2">
                {Object.entries(envVars).map(([key, value]) => (
                    <div key={key} className="flex gap-4">
                        <span className="font-bold">{key}:</span>
                        <span className={value ? "text-green-600" : "text-red-600"}>
                            {value ? `${value.substring(0, 5)}... (Présent)` : "MANQUANT"}
                        </span>
                    </div>
                ))}
            </div>
            <p className="mt-8 text-sm text-gray-500">
                Si une variable est manquante ici, elle n'est pas passée au navigateur par Vercel.
                Vérifiez vos réglages "Environment Variables" et assurez-vous qu'elles ne contiennent pas d'espaces.
            </p>
        </div>
    );
}
