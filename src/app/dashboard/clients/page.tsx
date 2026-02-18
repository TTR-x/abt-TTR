
'use client';

import { useState } from "react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { ReferredClient } from "@/lib/api";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

export default function ClientsPage() {
  const { user: authUser, isUserLoading } = useUser();
  const firestore = useFirestore();
  const [searchTerm, setSearchTerm] = useState('');

  const clientsRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return collection(firestore, `ambassadors/${authUser.uid}/clientReferrals`);
  }, [firestore, authUser]);

  const { data: clients, isLoading: isLoadingClients } = useCollection<ReferredClient>(clientsRef);

  const filteredClients = (clients || []).filter(client =>
    client.clientId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isUserLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <LoadingIndicator />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Vos Clients</h1>
          <p className="text-muted-foreground">
            Gérez et suivez tous les clients que vous avez référés.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Liste des Clients</CardTitle>
          <CardDescription>
            {isLoadingClients ? 'Chargement...' : `${filteredClients.length} clients au total.`}
          </CardDescription>
          <div className="flex items-center gap-2 pt-4">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un client..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Client ID</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date d'inscription</TableHead>
                <TableHead className="text-right">Commission (Monoyi / FCFA)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingClients ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                    <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                    <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                    <TableCell className="text-right"><Skeleton className="h-5 w-16 ml-auto" /></TableCell>
                  </TableRow>
                ))
              ) : filteredClients.length > 0 ? (
                filteredClients.map((client) => {
                  const baseName = client.name || client.clientId;
                  const shortName = baseName.substring(0, 3).toLowerCase();
                  const displayName = `client-${shortName}...`;

                  return (
                    <TableRow key={client.id}>
                      <TableCell>
                        <div className="font-medium text-blue-600 dark:text-blue-400">{displayName}</div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={client.isActive ? "default" : "secondary"}
                          className={
                            client.isActive
                              ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700"
                              : "bg-gray-100 text-gray-800 border-gray-200"
                          }
                        >
                          {client.isActive ? "Actif" : "Inscrit"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(client.referralDate).toLocaleDateString('fr-FR')}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex flex-col items-end">
                          <span className="font-bold">{(client.commissionEarned || 0).toFixed(2)} MYI</span>
                          <span className="text-xs text-muted-foreground">{((client.commissionEarned || 0) * 800).toLocaleString('fr-FR')} FCFA</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center">
                    Aucun client trouvé.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
