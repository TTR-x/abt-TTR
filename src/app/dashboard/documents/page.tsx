
'use client';

import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShoppingCart, Sparkles, Paintbrush, Eye, Award, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc, updateDoc, increment, arrayUnion } from "firebase/firestore";
import type { Ambassador } from "@/lib/api";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";

export default function DocumentsPage() {
    const { toast } = useToast();
    const { user: authUser } = useUser();
    const firestore = useFirestore();
    const [dialogOpen, setDialogOpen] = useState(false);
    const [view, setView] = useState<'options' | 'customize' | 'confirm_simple'>('options');
    const [customizationDetails, setCustomizationDetails] = useState({
        text: '',
        colors: '',
        images: '',
        instructions: '',
        whatsappNumber: '',
    });

    const ambassadorRef = useMemoFirebase(() => {
        if (!firestore || !authUser) return null;
        return doc(firestore, 'ambassadors', authUser.uid);
    }, [firestore, authUser]);

    const { data: ambassador } = useDoc<Ambassador>(ambassadorRef);

    const resetDialog = () => {
        setView('options');
        setCustomizationDetails({ text: '', colors: '', images: '', instructions: '', whatsappNumber: '' });
    };

    const handleOrder = async (isCustom = false) => {
        const cost = 8; // Coût en Monoyi
        if (!ambassadorRef || !ambassador) {
            toast({ variant: "destructive", title: "Erreur", description: "Impossible de récupérer les informations de l'utilisateur." });
            return;
        }

        if (!customizationDetails.whatsappNumber) {
            toast({ variant: "destructive", title: "Champ requis", description: "Veuillez fournir votre numéro WhatsApp pour la livraison." });
            return;
        }

        if (ambassador.monoyi < cost) {
            toast({ variant: "destructive", title: "Monoyi insuffisants", description: `Vous avez besoin de ${cost} Monoyi pour commander.` });
            setDialogOpen(false);
            resetDialog();
            return;
        }

        try {
            const requestPayload: any = {
                date: new Date().toISOString(),
                status: 'pending',
                type: isCustom ? 'custom' : 'simple',
                 details: { // Always include details now
                    whatsappNumber: customizationDetails.whatsappNumber,
                }
            };

            if (isCustom) {
                requestPayload.details = customizationDetails;
            }

            await updateDoc(ambassadorRef, {
                monoyi: increment(-cost), // Utiliser le champ monoyi
                visualRequests: arrayUnion(requestPayload)
            });
            toast({
                title: "Commande réussie !",
                description: `${cost} Monoyi ont été déduits. Votre visuel sera bientôt disponible.`,
            });
        } catch (error) {
            console.error("Error ordering visual: ", error);
            toast({ variant: "destructive", title: "Une erreur est survenue", description: "Votre commande n'a pas pu être traitée." });
        } finally {
            setDialogOpen(false);
            resetDialog();
        }
    };
    
    const handleOpenChange = (open: boolean) => {
        setDialogOpen(open);
        if (!open) {
            resetDialog();
        }
    }

  return (
    <div className="space-y-6">
        <div>
            <h1 className="text-3xl font-bold">Documents & Visuels</h1>
            <p className="text-muted-foreground">
               Tous les outils dont vous avez besoin pour promouvoir TTR Gestion.
            </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader>
                    <CardTitle>Pourquoi les visuels sont-ils importants ?</CardTitle>
                </CardHeader>
                <CardContent>
                    <ul className="space-y-4 text-muted-foreground">
                        <li className="flex items-start gap-3">
                            <Eye className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                            <span><span className="font-semibold text-foreground">Attirez l'attention :</span> Un bon visuel capte le regard beaucoup plus vite qu'un texte. C'est la première impression que vous donnez.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <Award className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                            <span><span className="font-semibold text-foreground">Soyez professionnel :</span> Des visuels de qualité montrent que vous êtes sérieux. Ils inspirent confiance à vos futurs clients.</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <TrendingUp className="h-5 w-5 text-primary flex-shrink-0 mt-1" />
                            <span><span className="font-semibold text-foreground">Gagnez plus :</span> Des publications attractives génèrent plus d'interactions, plus de clics sur votre lien, et donc plus de commissions pour vous.</span>
                        </li>
                    </ul>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Commander un visuel personnalisé</CardTitle>
                    <CardDescription>Utilisez vos Monoyi pour obtenir un visuel marketing à votre nom.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row items-center justify-between p-4 bg-secondary rounded-lg">
                        <div className="flex items-center gap-4 mb-4 sm:mb-0">
                            <Sparkles className="h-10 w-10 text-primary" />
                            <div>
                                <p className="font-bold text-lg">Visuel Personnalisé</p>
                                <p className="text-sm text-muted-foreground">Coût: <span className="font-bold text-primary">8 Monoyi</span></p>
                            </div>
                        </div>
                        <Dialog open={dialogOpen} onOpenChange={handleOpenChange}>
                          <DialogTrigger asChild>
                            <Button>
                                <ShoppingCart className="mr-2 h-4 w-4" /> Commander
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            {view === 'options' && (
                                <>
                                    <DialogHeader>
                                        <DialogTitle>Comment voulez-vous votre visuel ?</DialogTitle>
                                        <DialogDescription>
                                            Une commande simple est plus rapide. Une commande personnalisée vous permet de donner des instructions précises. Coût : 8 Monoyi.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid grid-cols-2 gap-4 py-4">
                                        <Button variant="outline" onClick={() => setView('confirm_simple')}>
                                            <Sparkles className="mr-2 h-4 w-4"/>
                                            Commande Simple
                                        </Button>
                                        <Button onClick={() => setView('customize')}>
                                            <Paintbrush className="mr-2 h-4 w-4"/>
                                            Personnaliser
                                        </Button>
                                    </div>
                                </>
                            )}
                            {view === 'confirm_simple' && (
                                <>
                                    <DialogHeader>
                                        <DialogTitle>Confirmer votre commande simple</DialogTitle>
                                        <DialogDescription>
                                            Veuillez fournir votre numéro WhatsApp pour la livraison du visuel. Voulez-vous vraiment dépenser 8 Monoyi ? Cette action est irréversible.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="whatsappNumberSimple">Numéro WhatsApp pour la livraison <span className="text-destructive">*</span></Label>
                                            <Input id="whatsappNumberSimple" placeholder="Ex: +228 90123456" value={customizationDetails.whatsappNumber} onChange={(e) => setCustomizationDetails({...customizationDetails, whatsappNumber: e.target.value})} required/>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                        <Button variant="ghost" onClick={() => setView('options')}>Retour</Button>
                                        <Button onClick={() => handleOrder(false)} disabled={!customizationDetails.whatsappNumber}>Confirmer et dépenser 8 Monoyi</Button>
                                    </DialogFooter>
                                </>
                            )}
                            {view === 'customize' && (
                                 <>
                                    <DialogHeader>
                                        <DialogTitle>Personnalisez votre visuel</DialogTitle>
                                        <DialogDescription>
                                            Donnez-nous des instructions pour créer le visuel parfait.
                                        </DialogDescription>
                                    </DialogHeader>
                                    <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto pr-4">
                                        <div className="grid gap-2">
                                            <Label htmlFor="whatsappNumber">Numéro WhatsApp pour la livraison <span className="text-destructive">*</span></Label>
                                            <Input id="whatsappNumber" placeholder="Ex: +228 90123456" value={customizationDetails.whatsappNumber} onChange={(e) => setCustomizationDetails({...customizationDetails, whatsappNumber: e.target.value})} required/>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="text">Texte principal (Optionnel)</Label>
                                            <Textarea id="text" placeholder="Ex: 'Promo spéciale ce week-end !'" value={customizationDetails.text} onChange={(e) => setCustomizationDetails({...customizationDetails, text: e.target.value})}/>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="colors">Couleurs dominantes (Optionnel)</Label>
                                            <Textarea id="colors" placeholder="Ex: 'Bleu et jaune, comme mon logo'" value={customizationDetails.colors} onChange={(e) => setCustomizationDetails({...customizationDetails, colors: e.target.value})}/>
                                        </div>
                                        <div className="grid gap-2">
                                            <Label htmlFor="images">Images à inclure (description, optionnel)</Label>
                                            <Textarea id="images" placeholder="Ex: 'Une photo de ma boutique, une image de famille souriante'" value={customizationDetails.images} onChange={(e) => setCustomizationDetails({...customizationDetails, images: e.target.value})}/>
                                        </div>
                                         <div className="grid gap-2">
                                            <Label htmlFor="instructions">Autres instructions (Optionnel)</Label>
                                            <Textarea id="instructions" placeholder="Ex: 'Je veux un style moderne et épuré.'" value={customizationDetails.instructions} onChange={(e) => setCustomizationDetails({...customizationDetails, instructions: e.target.value})}/>
                                        </div>
                                    </div>
                                    <DialogFooter>
                                         <Button variant="ghost" onClick={() => setView('options')}>Retour</Button>
                                         <Button onClick={() => handleOrder(true)} disabled={!customizationDetails.whatsappNumber}>Confirmer et dépenser 8 Monoyi</Button>
                                    </DialogFooter>
                                </>
                            )}
                          </DialogContent>
                        </Dialog>
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  );
}
