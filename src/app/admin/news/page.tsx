
'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, addDoc, query, orderBy, deleteDoc, doc } from 'firebase/firestore';
import type { News } from '@/lib/api';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2, PlusCircle, Trash2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

export default function AdminNewsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const newsRef = useMemoFirebase(() => {
    // Ne construire la requête que si Firestore est disponible
    if (!firestore) return null;
    return query(collection(firestore, 'news'), orderBy('date', 'desc'));
  }, [firestore]);
  
  const { data: newsItems, isLoading } = useCollection<News>(newsRef);

  const handleAddNews = async () => {
    if (!title || !description) {
      toast({
        variant: 'destructive',
        title: 'Champs requis',
        description: 'Le titre et la description sont obligatoires.',
      });
      return;
    }

    setIsSubmitting(true);
    try {
      if (!firestore) throw new Error("Firestore not available");
      
      const newsCollection = collection(firestore, 'news');
      await addDoc(newsCollection, {
        title,
        description,
        imageUrl,
        date: new Date().toISOString(),
      });

      toast({
        title: 'Actualité ajoutée',
        description: `L'actualité "${title}" a été publiée.`,
      });

      // Reset form
      setTitle('');
      setDescription('');
      setImageUrl('');

    } catch (error) {
      console.error(error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: "Une erreur est survenue lors de l'ajout de l'actualité.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
   const handleDeleteNews = async (id: string) => {
    if (!firestore) return;
    setIsDeleting(id);
    try {
        const docRef = doc(firestore, 'news', id);
        await deleteDoc(docRef);
        toast({
            title: "Suppression réussie",
            description: "L'actualité a été supprimée."
        });
    } catch (error) {
        console.error(error);
        toast({
            variant: 'destructive',
            title: "Erreur",
            description: "La suppression a échoué."
        });
    } finally {
        setIsDeleting(null);
    }
  }

  return (
    <div className="grid gap-8 md:grid-cols-3">
      <div className="md:col-span-1">
        <Card>
          <CardHeader>
            <CardTitle>Ajouter une Actualité</CardTitle>
            <CardDescription>
              Publiez une nouvelle information pour vos ambassadeurs.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Lancement du programme V2"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Détails de l'actualité..."
                rows={4}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL de l'image (Optionnel)</Label>
              <Input
                id="imageUrl"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <Button onClick={handleAddNews} disabled={isSubmitting} className="w-full">
              {isSubmitting ? <Loader2 className="animate-spin" /> : <PlusCircle className="mr-2"/>}
              {isSubmitting ? 'Publication...' : 'Publier'}
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="md:col-span-2">
        <Card>
          <CardHeader>
            <CardTitle>Actualités Publiées</CardTitle>
            <CardDescription>
              Liste des actualités les plus récentes.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {isLoading ? (
                Array.from({length: 3}).map((_, i) => <Skeleton key={i} className="h-16 w-full rounded-md" />)
              ) : newsItems && newsItems.length > 0 ? (
                newsItems.map((item) => (
                  <div key={item.id} className="flex items-center justify-between p-3 bg-secondary rounded-md">
                    <div>
                      <p className="font-medium">{item.title}</p>
                      <p className="text-sm text-muted-foreground">
                        Publié le {new Date(item.date).toLocaleDateString('fr-FR')}
                      </p>
                    </div>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" disabled={isDeleting === item.id}>
                            {isDeleting === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4 text-destructive" />}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Cette action est irréversible. L'actualité "{item.title}" sera supprimée définitivement.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Annuler</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDeleteNews(item.id)}>
                            Supprimer
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                ))
              ) : (
                <p className="text-center text-muted-foreground py-8">Aucune actualité publiée.</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
