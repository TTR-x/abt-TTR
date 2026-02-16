
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lightbulb, Share2, Users, MessageSquare, Phone, Globe } from "lucide-react";
import Link from "next/link";
import { useUser } from "@/firebase";
import LoadingLink from "@/components/loading-link";


export default function AdvicePage() {
    const { user } = useUser();
    
    // Génère le lien d'affiliation pour l'utilisateur connecté
    const affiliateLink = `https://www.ttrgestion.site/?ref=${(user as any)?.referralCode || ''}`;

    const tips = [
        {
            icon: <Share2 className="text-primary" />,
            title: "Partagez votre histoire",
            description: "Ne vous contentez pas de partager un lien. Racontez pourquoi vous utilisez TTR Gestion et comment l'application peut aider d'autres commerçants. L'authenticité est convaincante."
        },
        {
            icon: <Users className="text-primary" />,
            title: "Identifiez votre audience",
            description: "Pensez aux commerçants de votre quartier, à vos amis entrepreneurs ou aux groupes en ligne. Un message ciblé a plus d'impact."
        },
        {
            icon: <MessageSquare className="text-primary" />,
            title: "Utilisez les témoignages",
            description: "Si vous connaissez des gens qui ont eu du succès avec l'application, demandez-leur un petit témoignage. La preuve sociale est un puissant levier de persuasion."
        },
        {
            icon: <Lightbulb className="text-primary" />,
            title: "Soyez patient et persévérant",
            description: "Le succès ne vient pas toujours du jour au lendemain. Continuez à partager régulièrement et à interagir avec votre réseau. Vos efforts finiront par payer."
        }
    ];

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold">Conseils pour Réussir</h1>
            <p className="text-muted-foreground">
               Maximisez votre impact et vos commissions avec ces astuces.
            </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
            {tips.map((tip, index) => (
                <Card key={index}>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-3">
                            {tip.icon}
                            {tip.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">{tip.description}</p>
                    </CardContent>
                </Card>
            ))}
        </div>
        
        <div className="pt-6 grid gap-6 md:grid-cols-2">
            <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center gap-4 text-center">
                     <h3 className="text-xl font-semibold">Besoin d'aide personnalisée ?</h3>
                     <p className="text-muted-foreground max-w-md">
                        Notre équipe est là pour vous accompagner. Cliquez ci-dessous pour discuter directement avec un conseiller via WhatsApp.
                     </p>
                     <Button asChild>
                        <LoadingLink href="https://wa.me/22899974389" target="_blank">
                           <Phone className="mr-2 h-4 w-4"/> Demander un conseil
                        </LoadingLink>
                    </Button>
                </CardContent>
            </Card>
            <Card>
                <CardContent className="p-6 flex flex-col items-center justify-center gap-4 text-center">
                     <h3 className="text-xl font-semibold">Explorez le produit</h3>
                     <p className="text-muted-foreground max-w-md">
                        Mieux vous connaissez TTR Gestion, mieux vous le vendrez. Visitez le site officiel pour tout savoir sur l'application.
                     </p>
                     <Button asChild>
                        <LoadingLink href={affiliateLink} target="_blank">
                           <Globe className="mr-2 h-4 w-4"/> Visiter ttrgestion.site
                        </LoadingLink>
                    </Button>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
