

'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, Lock, Award, Star, Gem, Zap, TrendingUp } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { ReferredClient } from "@/lib/api";
import { LoadingIndicator } from "@/components/ui/loading-indicator";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { MonoyiIcon } from "@/components/icons/monoyi-icon";

const levels = [
    { 
        name: "Niveau 1", 
        icon: <Award className="text-orange-400" />,
        commissionParticulier: 0.3, // 15% de 1500F / 800
        commissionEntreprise: 0.8, // 15% de 4200F / 800
        clientsRequis: 10
    },
    { 
        name: "Niveau 2", 
        icon: <Star className="text-gray-400" />,
        commissionParticulier: 0.4, // 20%
        commissionEntreprise: 1.1, // 20%
        clientsRequis: 50
    },
    { 
        name: "Niveau 3", 
        icon: <Gem className="text-yellow-400" />,
        commissionParticulier: 0.5, // 25%
        commissionEntreprise: 1.3, // 25%
        clientsRequis: 100
    },
    { 
        name: "Niveau 4", 
        icon: <Zap className="text-blue-400" />,
        commissionParticulier: 0.7, // 35%
        commissionEntreprise: 1.8, // 35%
        clientsRequis: 1000
    },
];

const levelNames = [
    "Débutant",
    "Ambassadeur Reconnu",
    "Ambassadeur Confirmé",
    "Ambassadeur Élite",
    "Maître Ambassadeur"
];

function getCurrentLevel(activeClients: number) {
    if (activeClients < 10) return 1;
    if (activeClients < 50) return 2;
    if (activeClients < 100) return 3;
    if (activeClients < 1000) return 4;
    return 5; 
}


export default function LevelPage() {
    const { user: authUser, isUserLoading } = useUser();
    const firestore = useFirestore();

    const clientsRef = useMemoFirebase(() => {
        if (!firestore || !authUser) return null;
        return collection(firestore, `ambassadors/${authUser.uid}/clientReferrals`);
    }, [firestore, authUser]);

    const { data: clients, isLoading: isLoadingClients } = useCollection<ReferredClient>(clientsRef);

    if (isUserLoading || isLoadingClients) {
        return (
            <div className="flex items-center justify-center h-full">
                <LoadingIndicator />
            </div>
        );
    }
    
    const activeClients = clients?.filter(c => c.isActive).length || 0;
    const currentLevelIndex = getCurrentLevel(activeClients) - 1;
    const nextLevelIndex = currentLevelIndex + 1;
    
    const progressToNextLevel = levels[currentLevelIndex]?.clientsRequis 
        ? (activeClients / levels[currentLevelIndex].clientsRequis) * 100
        : 100;
        
    const clientsForNextLevel = levels[currentLevelIndex] ? levels[currentLevelIndex].clientsRequis - activeClients : 0;
    const justLeveledUp = levels.some(level => level.clientsRequis === activeClients);

  return (
    <div className="space-y-8">
        <div>
            <h1 className="text-3xl font-bold">Votre Parcours d'Ambassadeur</h1>
            <p className="text-muted-foreground">
                Suivez votre progression, débloquez de nouveaux niveaux et augmentez vos revenus.
            </p>
        </div>

        {justLeveledUp && (
             <Alert className="border-green-500 bg-green-50 dark:bg-green-900/30">
                <Award className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-700 dark:text-green-400">Félicitations !</AlertTitle>
                <AlertDescription className="text-green-600 dark:text-green-500">
                    Vous venez de passer au {levels[currentLevelIndex].name} ! Continuez comme ça.
                </AlertDescription>
            </Alert>
        )}

        <Card className="bg-secondary border-primary">
            <CardHeader>
                <CardTitle>Votre Statut Actuel</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center gap-4">
                    <div className="text-primary">{levels[currentLevelIndex]?.icon || <Award />}</div>
                    <div>
                        <h3 className="text-2xl font-bold">{levelNames[currentLevelIndex]}</h3>
                        <p className="text-muted-foreground">Vous êtes au {levels[currentLevelIndex]?.name || 'Niveau max'}.</p>
                    </div>
                </div>
                 {currentLevelIndex < levels.length && levels[currentLevelIndex]?.clientsRequis && (
                    <div className="space-y-2 pt-2">
                        <div className="flex justify-between font-mono text-sm">
                            <span>{activeClients} / {levels[currentLevelIndex].clientsRequis} clients</span>
                            <span>{clientsForNextLevel > 0 ? `${clientsForNextLevel} restants` : 'Objectif atteint!'}</span>
                        </div>
                        <Progress value={progressToNextLevel} />
                        <p className="text-xs text-muted-foreground text-center">
                            Progrès vers le {levelNames[nextLevelIndex]}
                        </p>
                    </div>
                 )}
            </CardContent>
        </Card>

        {/* Etape 1 */}
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-primary">Étape 1: Ambassadeur Reconnu</h2>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
                {levels.map((level, index) => (
                    <Card key={level.name} className={currentLevelIndex === index ? 'border-primary ring-2 ring-primary' : ''}>
                        <CardHeader>
                            <CardTitle className="flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    {level.icon} {level.name}
                                </div>
                                {currentLevelIndex === index && <Badge>Actuel</Badge>}
                                 {currentLevelIndex > index && <Badge variant="secondary" className="bg-green-100 text-green-800">Terminé</Badge>}
                            </CardTitle>
                            <CardDescription>Rémunération par client actif</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                             <div className="flex items-center justify-between text-sm p-2 rounded-md bg-background border">
                               <span className="text-muted-foreground">Objectif</span>
                               <span className="font-bold">{level.clientsRequis} Clients</span>
                           </div>
                            <div className="flex items-center justify-between text-sm p-2 rounded-md bg-background">
                                <span className="flex items-center gap-2 text-muted-foreground"><Users size={16} /> Particulier</span>
                                <span className="font-bold flex items-center gap-1">{level.commissionParticulier.toFixed(1)} <MonoyiIcon className="h-3 w-3" /></span>
                            </div>
                             <div className="flex items-center justify-between text-sm p-2 rounded-md bg-background">
                                <span className="flex items-center gap-2 text-muted-foreground"><Briefcase size={16} /> Entreprise</span>
                                <span className="font-bold flex items-center gap-1">{level.commissionEntreprise.toFixed(1)} <MonoyiIcon className="h-3 w-3" /></span>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
            <Card className="mt-4">
              <CardContent className="p-4">
                  <p className="text-sm text-center text-muted-foreground">
                    Taux de conversion : <span className="font-semibold text-foreground">1 Monoyi (MYI) = 800 FCFA</span>.
                    Retrait minimum : <span className="font-semibold text-foreground">5 MYI</span>.
                  </p>
              </CardContent>
            </Card>
        </div>

        {/* Etape 2 */}
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                <Lock className={currentLevelIndex < 3 ? 'text-muted-foreground' : ''}/>
                Étape 2: Ambassadeur Confirmé
            </h2>
            <Card className="border-dashed">
                <CardContent className="p-10 text-center text-muted-foreground">
                    <p>Rejoignez l'équipe TTR Gestion pour plus de missions et gagnez encore plus.</p>
                     <p className="font-semibold mt-2">
                        {currentLevelIndex < 3 
                            ? "Cette étape se débloque en atteignant le Niveau 4."
                            : "Félicitations ! Vous avez débloqué cette étape."
                        }
                    </p>
                </CardContent>
            </Card>
        </div>

        {/* Etape 3 */}
        <div className="space-y-4">
            <h2 className="text-2xl font-bold text-primary flex items-center gap-2">
                <Lock className="text-muted-foreground" />
                Étape 3: Senior
            </h2>
            <Card className="border-dashed">
                 <CardContent className="p-10 text-center text-muted-foreground">
                    <p>Accédez à des avantages exclusifs et à des responsabilités accrues.</p>
                    <p className="font-semibold mt-2">Débloquez l'Étape 2 pour voir les fonctionnalités.</p>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}


