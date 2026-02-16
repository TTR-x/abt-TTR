
'use client';

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Loader2 } from "lucide-react";
import Image from "next/image";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, doc, updateDoc } from "firebase/firestore";
import type { News } from "@/lib/api";
import { useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardNewsPage() {
    const firestore = useFirestore();
    const { user } = useUser();

    const newsRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'news'), orderBy('date', 'desc'));
    }, [firestore]);

    const { data: newsItems, isLoading } = useCollection<News>(newsRef);

    // Update the lastNewsView timestamp when the user visits the page
    useEffect(() => {
        if (user && firestore) {
            const ambassadorRef = doc(firestore, 'ambassadors', user.uid);
            updateDoc(ambassadorRef, {
                lastNewsView: new Date().toISOString()
            }).catch(console.error); // Silently fail if update fails
        }
    }, [user, firestore]);

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold">Actualités & Mises à jour</h1>
            <p className="text-muted-foreground">
              Les dernières informations sur le programme Ambassadeur et TTR Gestion.
            </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {isLoading ? (
                 Array.from({ length: 3 }).map((_, index) => (
                    <Card key={index} className="flex flex-col">
                        <CardHeader>
                            <Skeleton className="h-48 w-full mb-4" />
                            <Skeleton className="h-6 w-3/4" />
                            <Skeleton className="h-4 w-1/2" />
                        </CardHeader>
                        <CardContent className="flex-grow space-y-2">
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-4 w-full" />
                           <Skeleton className="h-4 w-2/3" />
                        </CardContent>
                        <CardFooter>
                            <Skeleton className="h-6 w-24" />
                        </CardFooter>
                    </Card>
                 ))
            ) : newsItems && newsItems.length > 0 ? (
                newsItems.map((item) => (
                    <Card key={item.id} className="flex flex-col">
                        <CardHeader>
                            <div className="relative h-48 w-full mb-4">
                                <Image 
                                    src={item.imageUrl || "https://picsum.photos/seed/defaultnews/600/400"}
                                    alt={item.title}
                                    fill
                                    className="rounded-t-lg object-cover"
                                    data-ai-hint={item.imageHint || "news article"}
                                />
                            </div>
                            <CardTitle>{item.title}</CardTitle>
                            <CardDescription>{new Date(item.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                            <p className="text-muted-foreground">{item.description}</p>
                        </CardContent>
                        <CardFooter>
                            <Button variant="link" className="px-0 text-primary">
                                Lire la suite <ArrowRight className="ml-2 h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))
            ) : (
                <div className="col-span-full text-center py-12 text-muted-foreground">
                    Aucune actualité pour le moment.
                </div>
            )}
        </div>
    </div>
  );
}
