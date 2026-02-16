
"use client";

import LoadingLink from "@/components/loading-link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Settings,
  DollarSign,
  BarChart,
  Star,
  Lightbulb,
  FileText,
  Newspaper,
  Info,
  Shield,
  UserPlus,
} from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";
import { useUser, useCollection, useFirestore, useMemoFirebase } from "@/firebase";
import { collection, query, orderBy, limit } from "firebase/firestore";
import type { News, Ambassador } from "@/lib/api";
import { useDoc } from "@/firebase/firestore/use-doc";
import { doc } from "firebase/firestore";

export function MainNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();
  const { user } = useUser();
  const firestore = useFirestore();

  const isAdmin = user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  // --- News notification logic ---
  const newsRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return query(collection(firestore, 'news'), orderBy('date', 'desc'), limit(1));
  }, [firestore]);

  const ambassadorRef = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return doc(firestore, 'ambassadors', user.uid);
  }, [firestore, user]);

  const { data: latestNews } = useCollection<News>(newsRef);
  const { data: ambassador } = useDoc<Ambassador>(ambassadorRef);
  
  const hasNewNews = latestNews && latestNews.length > 0 && ambassador && (
    !ambassador.lastNewsView || new Date(latestNews[0].date) > new Date(ambassador.lastNewsView)
  );
  // --- End news notification logic ---

  const navItems = [
    { href: "/dashboard", label: "Tableau de bord", icon: LayoutDashboard },
    { href: "/dashboard/clients", label: "Clients", icon: Users },
    { href: "/dashboard/earnings", label: "Revenus", icon: DollarSign },
    { href: "/dashboard/reports", label: "Rapports", icon: BarChart },
    { href: "/dashboard/level", label: "Niveau", icon: Star },
    { href: "/dashboard/advice", label: "Conseils", icon: Lightbulb },
    { href: "/dashboard/documents", label: "Documents", icon: FileText },
    { href: "/dashboard/news", label: "News", icon: Newspaper, notification: hasNewNews },
    { href: "/dashboard/about", label: "À propos", icon: Info },
    { href: "/dashboard/settings", label: "Paramètres", icon: Settings },
  ];

  if (isAdmin) {
    navItems.push({ href: "/admin/dashboard", label: "Outils Admin", icon: Shield });
  }


  const handleLinkClick = () => {
    setOpenMobile(false);
  }

  return (
     <SidebarMenu>
      {navItems.map(({ href, label, icon: Icon, notification }) => (
        <SidebarMenuItem key={label} >
           <SidebarMenuButton
            asChild
            isActive={pathname.startsWith(href) && (href !== '/dashboard' || pathname === '/dashboard')}
            className="w-full justify-start"
            tooltip={label}
          >
            <LoadingLink href={href} onClick={handleLinkClick} className="flex items-center justify-between w-full">
              <div className="flex items-center gap-2">
                <Icon className="size-4" />
                <span>{label}</span>
              </div>
              {notification && (
                <span className="w-2 h-2 rounded-full bg-red-500 mr-2 group-data-[collapsible=icon]:hidden" />
              )}
            </LoadingLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
