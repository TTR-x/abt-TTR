
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
        `${(amount || 0).toFixed(2)} MYI`;

    const formatFcfa = (amount: number) =>
        `${(amount * 800).toLocaleString('fr-FR')} FCFA`;

    const formatDate = (dateString: string) =>
        new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

    const MonoyiAmount = ({ amount, className = "text-3xl" }: { amount: number, className?: string }) => (
        <div className="flex flex-col">
            <div className={`${className} font-bold flex items-center gap-2`}>
                {(amount || 0).toFixed(2)} MYI <MonoyiIcon className="h-6 w-6 text-primary" />
            </div>
            <div className="text-sm font-normal text-muted-foreground mt-1">
                {(amount * 800).toLocaleString('fr-FR')} FCFA
            </div>
        </div>
    );

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
                        <MonoyiAmount amount={stats.totalCommission} />
                        <p className="text-xs text-muted-foreground mt-2">Gagnés depuis le début</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Retrait en attente</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MonoyiAmount amount={stats.pendingPayment} />
                        <p className="text-xs text-muted-foreground mt-2">Demandes de retrait en cours</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Dernier retrait validé</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <MonoyiAmount amount={stats.lastPayment} />
                        <p className="text-xs text-muted-foreground mt-2">
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
                                contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))', borderRadius: '8px' }}
                                formatter={(value: number) => [
                                    <div key="tooltip-content" className="flex flex-col gap-1">
                                        <span className="font-bold text-primary">{formatMonoyi(value)}</span>
                                        <span className="text-xs text-muted-foreground">{formatFcfa(value)}</span>
                                    </div>,
                                    ''
                                ]}
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
                <CardContent className="p-0 sm:p-6">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>Montant (MYI / FCFA)</TableHead>
                                <TableHead className="hidden sm:table-cell">Méthode</TableHead>
                                <TableHead>Statut</TableHead>
                                <TableHead className="hidden md:table-cell">Validation</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {history.length > 0 ? (
                                history.map((payout) => (
                                    <TableRow key={payout.id}>
                                        <TableCell className="text-xs sm:text-sm whitespace-nowrap">{formatDate(payout.requestDate)}</TableCell>
                                        <TableCell className="text-xs sm:text-sm font-semibold whitespace-nowrap">
                                            <div className="flex flex-col">
                                                <span>{formatMonoyi(payout.amount)}</span>
                                                <span className="text-[10px] font-normal text-muted-foreground">{formatFcfa(payout.amount)}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-xs sm:text-sm capitalize hidden sm:table-cell">{payout.method}</TableCell>
                                        <TableCell>
                                            <Badge variant={payout.status === 'completed' ? 'default' : 'secondary'}
                                                className={`text-[10px] sm:text-xs ${payout.status === 'completed' ? 'bg-green-100 text-green-800' : ''}`}>
                                                {payout.status === 'completed' ? 'Complété' : 'En attente'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-xs sm:text-sm whitespace-nowrap hidden md:table-cell">
                                            {payout.completionDate ? formatDate(payout.completionDate) : '—'}
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground italic">
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
