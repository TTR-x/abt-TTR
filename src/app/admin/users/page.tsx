'use client';

import { useState, useMemo } from "react";
import { useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query } from "firebase/firestore";
import type { UserProfile } from "@/lib/api";
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
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function AdminUsersPage() {
    const firestore = useFirestore();
    const [searchTerm, setSearchTerm] = useState("");

    const usersRef = useMemoFirebase(() => {
        if (!firestore) return null;
        return query(collection(firestore, 'users'));
    }, [firestore]);

    const { data: users, isLoading: isLoadingUsers } = useCollection<UserProfile>(usersRef);

    const filteredUsers = useMemo(() => {
        if (!users) return [];
        if (!searchTerm) return users;
        const lowerCaseSearchTerm = searchTerm.toLowerCase();
        return users.filter((user: UserProfile) =>
            user.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
            user.email.toLowerCase().includes(lowerCaseSearchTerm) ||
            user.id.toLowerCase().includes(lowerCaseSearchTerm)
        );
    }, [users, searchTerm]);

    const getInitials = (name?: string) => {
        if (!name) return '??';
        const names = name.split(' ');
        return names.length > 1 ? `${names[0][0]}${names[names.length - 1][0]}` : name.substring(0, 2);
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        try {
            return new Date(dateString).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
            });
        } catch {
            return 'N/A';
        }
    }

    return (
        <>
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold">Gestion des Utilisateurs</h1>
                    <p className="text-muted-foreground">
                        Visualisez tous les utilisateurs inscrits sur la plateforme.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <CardTitle>Tous les Utilisateurs</CardTitle>
                                <CardDescription>
                                    {isLoadingUsers ? 'Chargement...' : `${filteredUsers?.length || 0} utilisateurs trouvés.`}
                                </CardDescription>
                            </div>
                            <div className="relative w-full sm:w-auto sm:max-w-xs">
                                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Rechercher (nom, email, ID)..."
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
                                    <TableHead>Utilisateur</TableHead>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Statut</TableHead>
                                    <TableHead>Date d'inscription</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoadingUsers ? (
                                    Array.from({ length: 8 }).map((_, i) => (
                                        <TableRow key={i}>
                                            <TableCell><div className="flex items-center gap-3"><Skeleton className="h-10 w-10 rounded-full" /><div className="flex flex-col gap-1"><Skeleton className="h-4 w-24" /><Skeleton className="h-3 w-32" /></div></div></TableCell>
                                            <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                                            <TableCell><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                                            <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                                            <TableCell className="text-right"><Skeleton className="h-8 w-32 ml-auto" /></TableCell>
                                        </TableRow>
                                    ))
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map((user: UserProfile) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div className="flex items-center gap-3">
                                                    <Avatar>
                                                        <AvatarImage src={`https://picsum.photos/seed/${user.id}/40/40`} />
                                                        <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                                                    </Avatar>
                                                    <div>
                                                        <div className="font-medium">{user.name}</div>
                                                        <div className="text-xs text-muted-foreground">{user.email}</div>
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <code className="text-xs bg-secondary px-2 py-1 rounded">{user.id.substring(0, 12)}...</code>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant={user.isAmbassador ? 'default' : 'secondary'}>
                                                    {user.isAmbassador ? 'Ambassadeur' : 'Utilisateur'}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm text-muted-foreground">
                                                {formatDate(user.createdAt)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {user.isAmbassador ? (
                                                    <Button variant="outline" size="sm" asChild>
                                                        <Link href={`/admin/ambassadors`}>
                                                            <ExternalLink className="mr-2 h-3 w-3" />Voir profil
                                                        </Link>
                                                    </Button>
                                                ) : (
                                                    <span className="text-xs text-muted-foreground">-</span>
                                                )}
                                            </TableCell>
                                        </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={5} className="h-24 text-center">Aucun utilisateur trouvé.</TableCell></TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>
        </>
    );
}
