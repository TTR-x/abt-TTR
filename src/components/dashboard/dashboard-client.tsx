
'use client'

import type { Ambassador, ReferredClient } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  Copy,
  Users,
  Star,
  TrendingUp,
  Lightbulb,
  Share2,
  MessageSquare,
  Users as UsersIcon,
  Gift,
  Award,
  Loader2,
  Clock,
  Ticket,
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "../ui/separator"
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel"
import LoadingLink from "@/components/loading-link"
import { useEffect, useState, useTransition } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { MonoyiIcon } from "../icons/monoyi-icon"

function PromoCodeCard({ ambassador }: { ambassador: Ambassador }) {
  const { toast } = useToast();

  // If the code exists, show it.
  if ((ambassador as any).referralCode) {
    const copyClientCode = () => {
      navigator.clipboard.writeText((ambassador as any).referralCode);
      toast({
        title: "Copié dans le presse-papiers!",
        description: "Votre code promo a été copié.",
      });
    };

    return (
      <Card className="bg-primary text-primary-foreground">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Votre Code Promo</CardTitle>
          <Copy className="h-4 w-4 text-primary-foreground/70 cursor-pointer" onClick={copyClientCode} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold tracking-wider">
            {(ambassador as any).referralCode}
          </div>
        </CardContent>
      </Card>
    );
  }

  // Default state: a message indicating the code is pending.
  return (
    <Card className="bg-secondary">
      <CardHeader>
        <CardTitle className="text-sm font-medium">Code Promo</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col items-center justify-center gap-2 text-center">
        <Clock className="h-6 w-6 text-muted-foreground" />
        <p className="font-semibold text-muted-foreground">Bientôt disponible</p>
        <p className="text-xs text-muted-foreground/80">Votre code sera affiché ici dans 48h au plus.</p>
      </CardContent>
    </Card>
  );
}


export default function DashboardClient({ ambassador, clients, stats, conversionRate }: DashboardClientProps) {
  const [ambassadorReferralLink, setAmbassadorReferralLink] = useState('');

  useEffect(() => {
    if (typeof window !== 'undefined') {
      setAmbassadorReferralLink(`${window.location.origin}/login?ref=${ambassador.referralCode}`);
    }
  }, [ambassador.referralCode]);

  const levelRequirements = [
    { level: 1, clients: 10 },
    { level: 2, clients: 50 },
    { level: 3, clients: 100 },
    { level: 4, clients: 1000 },
  ];

  const currentLevelInfo = levelRequirements[ambassador.level - 1] || levelRequirements[levelRequirements.length - 1];
  const nextLevelInfo = levelRequirements[ambassador.level];

  const activeClients = stats.activeClients;
  const progressToNextLevel = nextLevelInfo ? (activeClients / nextLevelInfo.clients) * 100 : 100;
  const clientsForNextLevel = nextLevelInfo ? Math.max(0, nextLevelInfo.clients - activeClients) : 0;

  const tips = [
    {
      icon: <Share2 className="h-6 w-6 text-primary" />,
      title: "Partagez votre histoire",
      description: "Racontez pourquoi vous utilisez TTR Gestion. L'authenticité est convaincante."
    },
    {
      icon: <UsersIcon className="h-6 w-6 text-primary" />,
      title: "Identifiez votre audience",
      description: "Pensez aux commerçants de votre quartier ou à vos amis entrepreneurs."
    },
    {
      icon: <MessageSquare className="h-6 w-6 text-primary" />,
      title: "Utilisez les témoignages",
      description: "La preuve sociale est un puissant levier de persuasion. Partagez des succès."
    },
    {
      icon: <Lightbulb className="h-6 w-6 text-primary" />,
      title: "Soyez patient et persévérant",
      description: "Le succès ne vient pas toujours du jour au lendemain. La régularité paie."
    }
  ];

  return (
    <>
      <div className="w-full mb-6 min-w-0 overflow-hidden">
        <Carousel
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full"
        >
          <CarouselContent className="-ml-2">
            {tips.map((tip, index) => (
              <CarouselItem key={index} className="pl-2 basis-full sm:basis-1/2 lg:basis-1/3">
                <div className="p-1">
                  <Card className="bg-secondary/50 border-secondary">
                    <CardContent className="flex items-center gap-3 p-3">
                      {tip.icon}
                      <div className="flex flex-col min-w-0">
                        <p className="font-semibold text-sm truncate">{tip.title}</p>
                        <p className="text-xs text-muted-foreground line-clamp-2">{tip.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden sm:flex" />
          <CarouselNext className="hidden sm:flex" />
        </Carousel>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Solde Monoyi</CardTitle>
            <MonoyiIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex flex-col">
              <span>{(ambassador.monoyi || 0).toFixed(2)} MYI</span>
              <span className="text-sm font-normal text-muted-foreground">{((ambassador.monoyi || 0) * 800).toLocaleString('fr-FR')} FCFA</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">+{(stats.pointsThisMonth || 0).toFixed(2)} Monoyi ce mois-ci</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clients Actifs</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+{stats.activeClients}</div>
            <p className="text-xs text-muted-foreground">sur {stats.totalClients} au total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créditation en attente</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold flex flex-col">
              <span>{(stats.pendingMonoyi || 0).toFixed(2)} MYI</span>
              <span className="text-sm font-normal text-muted-foreground">{((stats.pendingMonoyi || 0) * 800).toLocaleString('fr-FR')} FCFA</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">{stats.pendingClients} client{stats.pendingClients > 1 ? 's' : ''} à vérifier</p>
          </CardContent>
        </Card>
        <PromoCodeCard ambassador={ambassador} />
      </div>

      <div className="grid gap-4 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4 self-start">
          <CardHeader className="pb-2 sm:pb-4">
            <CardTitle className="text-lg sm:text-xl">Clients Référés Récemment</CardTitle>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client</TableHead>
                  <TableHead>Statut</TableHead>
                  <TableHead className="text-right">Monoyi</TableHead>
                  <TableHead className="text-right hidden sm:table-cell">Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.slice(0, 5).length > 0 ? (
                  clients.slice(0, 5).map((client) => (
                    <TableRow key={client.id}>
                      <TableCell className="py-2">
                        <div className="font-medium text-xs sm:text-sm">{`Client ${client.clientId.substring(0, 8)}...`}</div>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant={client.status === 'active' ? "default" : "secondary"} className={`text-[10px] sm:text-xs ${client.status === 'active' ? 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/40 dark:text-green-300 dark:border-green-700' : 'bg-gray-100 text-gray-800 border-gray-200'}`}>
                          {client.status === 'active' ? 'Actif' : 'Inscrit'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right py-2">
                        <div className="flex flex-col items-end">
                          <span className="text-xs sm:text-sm font-medium">{(client.commissionEarned || 0).toFixed(2)} MYI</span>
                          <span className="text-[10px] text-muted-foreground">{((client.commissionEarned || 0) * 800).toLocaleString('fr-FR')} F</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right py-2 text-xs text-muted-foreground hidden sm:table-cell">{new Date(client.referralDate).toLocaleDateString('fr-FR')}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-8 text-muted-foreground italic">
                      Aucun client référé pour le moment.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card className="col-span-1 lg:col-span-3">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="text-yellow-400" /> Niveau Ambassadeur
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {nextLevelInfo ? (
              <>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm font-medium">
                    <span>Progrès vers le Niveau {ambassador.level + 1}</span>
                    <span>
                      {activeClients} / {nextLevelInfo.clients}
                    </span>
                  </div>
                  <Progress value={progressToNextLevel} className="[&>*]:bg-primary" />
                </div>
                <p className="text-sm text-muted-foreground">
                  Il vous manque {clientsForNextLevel} clients actifs pour atteindre le niveau {ambassador.level + 1}.
                </p>
              </>
            ) : (
              <div>
                <p className="font-semibold text-primary">Félicitations ! Vous avez atteint le niveau maximum !</p>
              </div>
            )}
            <Separator />
            <div className="space-y-2 text-sm">
              <p className="font-medium">Objectifs en clients :</p>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                {levelRequirements.map(req => (
                  <li key={req.level} className={ambassador.level === req.level ? "font-bold text-primary" : ""}>
                    <span className="font-semibold text-foreground">Niveau {req.level}:</span> {req.clients} clients actifs
                  </li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      </div >

      <Card className="mt-4">
        <CardContent className="p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-primary/10 p-3 rounded-full">
              <Gift className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-lg">Invitez un ami ambassadeur</h3>
              <p className="text-sm text-muted-foreground">Gagnez <span className="font-bold text-primary">10 points</span> (niveau) et <span className="font-bold text-primary">100 FCFA</span> (crédités après vérification) lorsqu'il s'inscrit.</p>
            </div>
          </div>
          {ambassador.level < 2 ? (
            <Dialog>
              <DialogTrigger asChild>
                <Button>Inviter maintenant</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Accès restreint</DialogTitle>
                  <DialogDescription>
                    Cette fonctionnalité est disponible uniquement à partir du niveau 2.
                  </DialogDescription>
                </DialogHeader>
              </DialogContent>
            </Dialog>
          ) : (
            <Button asChild>
              <LoadingLink href={ambassadorReferralLink} target="_blank">Inviter maintenant</LoadingLink>
            </Button>
          )}
        </CardContent>
      </Card>
    </>
  )
}

type DashboardClientProps = {
  ambassador: Ambassador
  clients: (ReferredClient & { name: string; signupDate: string; status: 'active' | 'inactive'; commission: number })[]
  stats: {
    totalCommission: number
    totalClients: number
    activeClients: number
    pendingClients: number
    pendingMonoyi: number
    pointsThisMonth: number
    conversionRateDiff: number
  }
  conversionRate: number
}
