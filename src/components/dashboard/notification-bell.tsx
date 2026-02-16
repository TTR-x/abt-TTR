'use client';

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Bell, Mail } from "lucide-react";
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit, doc, updateDoc } from "firebase/firestore";
import type { Notification } from "@/lib/api";
import { Skeleton } from "@/components/ui/skeleton";
import LoadingLink from "../loading-link";
import { Badge } from "../ui/badge";

export function NotificationBell() {
  const { user: authUser } = useUser();
  const firestore = useFirestore();

  const notificationsRef = useMemoFirebase(() => {
    if (!firestore || !authUser) return null;
    return query(collection(firestore, `ambassadors/${authUser.uid}/notifications`), orderBy('date', 'desc'), limit(10));
  }, [firestore, authUser]);

  const { data: notifications, isLoading } = useCollection<Notification>(notificationsRef);

  const unreadCount = notifications?.filter(n => !n.isRead).length || 0;

  const handleMarkAsRead = async (notificationId: string) => {
    if (!firestore || !authUser) return;
    const notifRef = doc(firestore, `ambassadors/${authUser.uid}/notifications`, notificationId);
    await updateDoc(notifRef, { isRead: true });
  };
  
  const handleMarkAllAsRead = async () => {
    if (!firestore || !authUser || !notifications) return;
    const batch = [];
    for (const notif of notifications) {
        if (!notif.isRead) {
            const notifRef = doc(firestore, `ambassadors/${authUser.uid}/notifications`, notif.id);
            batch.push(updateDoc(notifRef, { isRead: true }));
        }
    }
    await Promise.all(batch);
  }

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    let interval = seconds / 31536000;
    if (interval > 1) return `il y a ${Math.floor(interval)} an(s)`;
    interval = seconds / 2592000;
    if (interval > 1) return `il y a ${Math.floor(interval)} mois`;
    interval = seconds / 86400;
    if (interval > 1) return `il y a ${Math.floor(interval)} jour(s)`;
    interval = seconds / 3600;
    if (interval > 1) return `il y a ${Math.floor(interval)} heure(s)`;
    interval = seconds / 60;
    if (interval > 1) return `il y a ${Math.floor(interval)} minute(s)`;
    return "à l'instant";
  };


  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex justify-between items-center">
            <span>Notifications</span>
            {unreadCount > 0 && <Button variant="link" size="sm" className="h-auto p-0" onClick={handleMarkAllAsRead}>Tout marquer comme lu</Button>}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {isLoading ? (
          <div className="p-2 space-y-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        ) : notifications && notifications.length > 0 ? (
            notifications.map((notif) => {
                const content = (
                    <div className="flex items-start gap-3">
                        {!notif.isRead && <div className="h-2 w-2 rounded-full bg-primary mt-1.5" />}
                        <div className={notif.isRead ? "pl-5" : ""}>
                            <p className="font-medium text-sm">{notif.title}</p>
                            <p className="text-xs text-muted-foreground">{notif.message}</p>
                            <p className="text-xs text-muted-foreground/80 mt-1">{formatTimeAgo(notif.date)}</p>
                        </div>
                    </div>
                );

                if (notif.link) {
                    return (
                        <DropdownMenuItem key={notif.id} asChild>
                            <LoadingLink href={notif.link} className="flex flex-col items-start whitespace-normal" onClick={() => handleMarkAsRead(notif.id)}>
                                {content}
                            </LoadingLink>
                        </DropdownMenuItem>
                    );
                }

                return (
                    <DropdownMenuItem key={notif.id} className="flex flex-col items-start whitespace-normal h-auto" onClick={() => handleMarkAsRead(notif.id)}>
                       {content}
                    </DropdownMenuItem>
                );
            })
        ) : (
          <div className="p-4 text-center text-sm text-muted-foreground">
             <Mail className="mx-auto h-8 w-8 mb-2"/>
            Vous n'avez aucune notification.
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
