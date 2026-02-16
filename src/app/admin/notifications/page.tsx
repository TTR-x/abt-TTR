
'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { sendNotificationToAll } from '@/app/actions';
import { Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? <Loader2 className="animate-spin" /> : <Send className="mr-2" />}
      {pending ? 'Envoi en cours...' : 'Envoyer la notification à tous'}
    </Button>
  );
}

export default function AdminNotificationsPage() {
  const [state, formAction] = useActionState(sendNotificationToAll, null);

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Envoyer une Notification de Groupe</CardTitle>
          <CardDescription>
            Créez et envoyez une notification à tous les ambassadeurs inscrits.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Titre</Label>
              <Input id="title" name="title" placeholder="Ex: Nouvelle fonctionnalité disponible !" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea id="message" name="message" placeholder="Détaillez ici votre annonce..." required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="link">Lien (Optionnel)</Label>
              <Input id="link" name="link" placeholder="Ex: /dashboard/news" />
              <p className="text-xs text-muted-foreground">
                Lien interne (ex: /dashboard/level) ou externe (ex: https://...).
              </p>
            </div>
            
            {state?.success && (
              <Alert variant="default" className="bg-green-50 border-green-200 text-green-800">
                <CheckCircle className="h-4 w-4 !text-green-800" />
                <AlertTitle>Succès !</AlertTitle>
                <AlertDescription>{state.success}</AlertDescription>
              </Alert>
            )}

            {state?.error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erreur</AlertTitle>
                <AlertDescription>{state.error}</AlertDescription>
              </Alert>
            )}

            <SubmitButton />
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
