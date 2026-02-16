
'use client';

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer
} from "recharts";
import { Badge } from "@/components/ui/badge";
import type { Payout } from "@/lib/api";
import { MonoyiIcon } from "../icons/monoyi-icon";

interface EarningsClientProps {
    stats: {
        totalCommission: number;
        pendingPayment: number;
        lastPayment: number;
        lastPaymentDate: string | null;
    };
    chartData: { name: string; monoyi: number }[];
    history: Payout[];
}

export default function EarningsClient({ stats, chartData, history }: EarningsClientProps) {

  const formatMonoyi = (amount: number) => 
    `${amount.toLocaleString('fr-FR')} MYI`;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold">Vos Revenus</h1>
            <p className="text-muted-foreground">
                Suivez vos Monoyi et l'historique de vos retraits.
            </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Card>
                <CardHeader>
                    <CardTitle>Monoyi Totaux Gagnés</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold flex items-center gap-2">
                        {formatMonoyi(stats.totalCommission)} <MonoyiIcon className="h-6 w-6 text-primary" />
                    </div>
                     <p className="text-xs text-muted-foreground">Gagnés depuis le début</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle>Retrait en attente</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">
                        {formatMonoyi(stats.pendingPayment)}
                    </div>
                     <p className="text-xs text-muted-foreground">Demandes de retrait en cours</p>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle>Dernier retrait validé</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="text-3xl font-bold">
                        {formatMonoyi(stats.lastPayment)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                        {stats.lastPaymentDate ? `Validé le ${formatDate(stats.lastPaymentDate)}` : 'Aucun retrait reçu'}
                    </p>
                </CardContent>
            </Card>
        </div>
        
        <Card>
            <CardHeader>
                <CardTitle>Évolution des Monoyi gagnés</CardTitle>
                <CardDescription>Monoyi gagnés par mois.</CardDescription>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip
                            contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }}
                            formatter={(value: number) => [formatMonoyi(value), 'Monoyi']}
                        />
                        <Legend />
                        <Bar dataKey="monoyi" fill="hsl(var(--primary))" name="Monoyi" />
                    </BarChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>

        <Card>
            <CardHeader>
                <CardTitle>Historique des Retraits</CardTitle>
                <CardDescription>
                    Les retraits sont généralement effectués dans les 48 heures suivant la demande.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date de demande</TableHead>
                            <TableHead>Montant</TableHead>
                            <TableHead>Méthode</TableHead>
                            <TableHead>Statut</TableHead>
                            <TableHead>Date de validation</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {history.length > 0 ? (
                            history.map((payout) => (
                                <TableRow key={payout.id}>
                                    <TableCell>{formatDate(payout.requestDate)}</TableCell>
                                    <TableCell>{formatMonoyi(payout.amount)}</TableCell>
                                    <TableCell>{payout.method}</TableCell>
                                    <TableCell>
                                        <Badge variant={payout.status === 'completed' ? 'default' : 'secondary'}
                                            className={payout.status === 'completed' ? 'bg-green-100 text-green-800' : ''}>
                                            {payout.status === 'completed' ? 'Complété' : 'En attente'}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {payout.completionDate ? formatDate(payout.completionDate) : '—'}
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    Aucun historique de retrait disponible.
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
