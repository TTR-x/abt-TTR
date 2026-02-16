
'use client';

import { useState } from 'react';
import { useFirestore, useCollection, useMemoFirebase } from '@/firebase';
import { collection, query, orderBy, doc, updateDoc } from 'firebase/firestore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Eye, Mail } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface SupportMessage {
    id: string;
    userId: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    date: string;
    status: 'new' | 'read' | 'archived';
}

export default function AdminSupportPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [selectedMessage, setSelectedMessage] = useState<SupportMessage | null>(null);

  const supportMessagesRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'supportMessages'), orderBy('date', 'desc'));
  }, [firestore]);

  const { data: messages, isLoading } = useCollection<SupportMessage>(supportMessagesRef);

  const handleViewMessage = async (message: SupportMessage) => {
    setSelectedMessage(message);
    if (message.status === 'new' && firestore) {
      try {
        const messageRef = doc(firestore, 'supportMessages', message.id);
        await updateDoc(messageRef, { status: 'read' });
      } catch (error) {
        console.error("Failed to mark message as read:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de marquer le message comme lu.",
        });
      }
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusBadge = (status: SupportMessage['status']) => {
    switch (status) {
      case 'new':
        return <Badge className="bg-blue-100 text-blue-800">Nouveau</Badge>;
      case 'read':
        return <Badge variant="secondary">Lu</Badge>;
      case 'archived':
        return <Badge variant="outline">Archivé</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Messages de Support</h1>
          <p className="text-muted-foreground">Consultez et gérez les messages envoyés par les utilisateurs.</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Boîte de Réception</CardTitle>
            <CardDescription>
              {isLoading ? 'Chargement des messages...' : `${messages?.length || 0} messages reçus.`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Statut</TableHead>
                  <TableHead>De</TableHead>
                  <TableHead>Sujet</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                      <TableCell><div className="flex flex-col gap-1"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-32" /></div></TableCell>
                      <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                      <TableCell className="text-right"><Skeleton className="h-8 w-10 ml-auto" /></TableCell>
                    </TableRow>
                  ))
                ) : messages && messages.length > 0 ? (
                  messages.map((message) => (
                    <TableRow key={message.id} className={message.status === 'new' ? 'font-bold' : ''}>
                      <TableCell>{getStatusBadge(message.status)}</TableCell>
                      <TableCell>
                        <div>{message.name}</div>
                        <div className="text-xs text-muted-foreground font-normal">{message.email}</div>
                      </TableCell>
                      <TableCell>{message.subject}</TableCell>
                      <TableCell>{formatDate(message.date)}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => handleViewMessage(message)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                       <Mail className="mx-auto h-8 w-8 mb-2"/>
                       Boîte de réception vide.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedMessage?.subject}</DialogTitle>
            <DialogDescription>
              De : {selectedMessage?.name} ({selectedMessage?.email}) <br />
              Reçu le : {selectedMessage && formatDate(selectedMessage.date)}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 max-h-[50vh] overflow-y-auto">
            <p className="whitespace-pre-wrap">{selectedMessage?.message}</p>
          </div>
          <DialogFooter>
             <a href={`mailto:${selectedMessage?.email}?subject=RE: ${selectedMessage?.subject}`} className="w-full sm:w-auto">
                <Button className="w-full">
                    <Mail className="mr-2 h-4 w-4" /> Répondre par e-mail
                </Button>
            </a>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

    