
'use client';

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Calendar as CalendarIcon, FileDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format, isWithinInterval } from "date-fns";
import { fr } from "date-fns/locale";
import type { DateRange } from "react-day-picker";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection } from "firebase/firestore";
import type { ReferredClient, Payout } from "@/lib/api";
import { LoadingIndicator } from "@/components/ui/loading-indicator";

interface Report {
  title: string;
  type: string;
  date: string;
  format: string;
}

export default function ReportsPage() {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<string>();
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [formatType, setFormatType] = useState<string>("csv");
  const [recentReports, setRecentReports] = useState<Report[]>([]);

  const { user: authUser, isUserLoading } = useUser();
  const firestore = useFirestore();

  const clientsRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return collection(firestore, `ambassadors/${authUser.uid}/clientReferrals`);
  }, [firestore, authUser]);

  const payoutsRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return collection(firestore, `ambassadors/${authUser.uid}/payouts`);
  }, [firestore, authUser]);

  const { data: clients, isLoading: isLoadingClients } = useCollection<ReferredClient>(clientsRef);
  const { data: payouts, isLoading: isLoadingPayouts } = useCollection<Payout>(payoutsRef);

  const handleGenerateReport = () => {
    if (!reportType || !dateRange?.from || !dateRange?.to) {
        toast({
            variant: "destructive",
            title: "Champs manquants",
            description: "Veuillez sélectionner un type de rapport et une plage de dates.",
        });
        return;
    }
    
    let recordsCount = 0;
    const interval = { start: dateRange.from, end: dateRange.to };

    if (reportType === 'clients' || reportType === 'commissions') {
        recordsCount = (clients || []).filter(c => isWithinInterval(new Date(c.referralDate), interval)).length;
    } else if (reportType === 'performance') { // For performance, it could be a summary, so let's count clients for now.
        recordsCount = (clients || []).filter(c => isWithinInterval(new Date(c.referralDate), interval)).length;
    }

    toast({
        title: "Génération en cours...",
        description: `Votre rapport de ${reportType.toLowerCase()} avec ${recordsCount} enregistrements est en cours de création.`,
    });
    
    const newReport: Report = {
        title: `Rapport de ${reportType} - ${format(dateRange.from, 'dd/MM/yy')} au ${format(dateRange.to, 'dd/MM/yy')}`,
        type: reportType,
        date: format(new Date(), 'dd/MM/yyyy'),
        format: formatType.toUpperCase(),
    };

    setTimeout(() => {
        setRecentReports(prev => [newReport, ...prev]);
        toast({
            title: "Rapport prêt !",
            description: "Votre rapport a été généré et ajouté à la liste des rapports récents.",
            action: <Button variant="outline" size="sm" onClick={() => alert('Le téléchargement commencerait maintenant.')}><Download className="mr-2 h-4 w-4" />Télécharger</Button>
        });
    }, 2000);
  };

  if (isUserLoading || isLoadingClients || isLoadingPayouts) {
    return (
        <div className="flex items-center justify-center h-full">
            <LoadingIndicator />
        </div>
    );
  }

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold">Rapports & Archives</h1>
            <p className="text-muted-foreground">
               Générez et téléchargez vos rapports de performance et de commissions.
            </p>
        </div>

        <Card>
            <CardHeader>
                <CardTitle>Générer un nouveau rapport</CardTitle>
                <CardDescription>
                    Sélectionnez une période et un type de rapport pour générer un fichier.
                </CardDescription>
            </CardHeader>
            <CardContent>
                 <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    <div className="space-y-2">
                        <p className="text-sm font-medium">Type de rapport</p>
                        <Select value={reportType} onValueChange={setReportType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choisir un type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="commissions">Rapport de commissions</SelectItem>
                                <SelectItem value="performance">Rapport de performance</SelectItem>
                                <SelectItem value="clients">Liste des clients</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <p className="text-sm font-medium">Plage de dates</p>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={"outline"}
                                className="w-full justify-start text-left font-normal"
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                    <>
                                        {format(dateRange.from, "LLL dd, y", { locale: fr })} -{" "}
                                        {format(dateRange.to, "LLL dd, y", { locale: fr })}
                                    </>
                                    ) : (
                                    format(dateRange.from, "LLL dd, y", { locale: fr })
                                    )
                                ) : (
                                    <span>Choisir une plage</span>
                                )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                mode="range"
                                selected={dateRange}
                                onSelect={setDateRange}
                                locale={fr}
                                numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                     <div className="space-y-2">
                        <p className="text-sm font-medium">Format</p>
                        <Select value={formatType} onValueChange={setFormatType}>
                            <SelectTrigger>
                                <SelectValue placeholder="Format" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="csv">CSV</SelectItem>
                                <SelectItem value="pdf">PDF</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                 </div>
                <div className="pt-6">
                  <Button onClick={handleGenerateReport}><FileDown className="mr-2"/>Générer le rapport</Button>
                </div>
            </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Rapports récents</CardTitle>
                <CardDescription>Voici la liste de vos derniers rapports générés.</CardDescription>
            </CardHeader>
            <CardContent>
                {recentReports.length > 0 ? (
                    <ul className="space-y-3">
                    {recentReports.map((report, index) => (
                        <li key={index} className="flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 bg-secondary rounded-lg">
                            <div className="mb-2 sm:mb-0">
                                <p className="font-medium">{report.title}</p>
                                <p className="text-sm text-muted-foreground">Généré le {report.date} • Format: {report.format}</p>
                            </div>
                            <Button variant="outline" size="icon" onClick={() => alert('Le téléchargement commencerait maintenant.')}><Download className="h-4 w-4" /></Button>
                        </li>
                    ))}
                    </ul>
                ) : (
                    <div className="text-center text-muted-foreground py-10">
                        Aucun rapport généré pour le moment.
                    </div>
                )}
            </CardContent>
        </Card>
    </div>
  );
}
