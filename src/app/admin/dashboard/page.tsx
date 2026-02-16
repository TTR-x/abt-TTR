
'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";
import LoadingLink from "@/components/loading-link";


// Simple placeholder page for the admin dashboard.
// Route protection is handled in the dashboard layout.
export default function AdminDashboardPage() {
  return (
    <div className="flex flex-col">
       <div>
        <h1 className="text-3xl font-bold">Tableau de Bord Admin</h1>
        <p className="text-muted-foreground">Gérez les ambassadeurs, les paiements et les paramètres.</p>
      </div>

      <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <LoadingLink href="/admin/ambassadors">
            <Card className="hover:bg-muted/50 transition-colors">
                <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                        <Users className="text-primary"/>
                        Liste des Ambassadeurs
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Voir et gérer tous les ambassadeurs inscrits sur la plateforme.</p>
                </CardContent>
            </Card>
        </LoadingLink>
      </div>
    </div>
  );
}
