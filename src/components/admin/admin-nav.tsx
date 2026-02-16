
'use client';

import LoadingLink from "@/components/loading-link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Shield,
  CircleDollarSign,
  Newspaper,
  UserCheck,
  Send,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { SidebarMenu, SidebarMenuItem, SidebarMenuButton, useSidebar } from "@/components/ui/sidebar";

export default function AdminNav() {
  const pathname = usePathname();
  const { setOpenMobile } = useSidebar();

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard Admin", icon: LayoutDashboard },
    { href: "/admin/ambassadors", label: "Ambassadeurs", icon: Users },
    { href: "/admin/users", label: "Utilisateurs", icon: Shield },
    { href: "/admin/code-requests", label: "Demandes de Code", icon: Sparkles },
    { href: "/admin/payouts", label: "Demandes de Retrait", icon: CircleDollarSign },
    { href: "/admin/verifications", label: "Vérifications", icon: UserCheck },
    { href: "/admin/news", label: "Gestion des News", icon: Newspaper },
    { href: "/admin/notifications", label: "Notifications", icon: Send },
    { href: "/admin/support", label: "Support", icon: MessageSquare },
  ];

  const handleLinkClick = () => {
    setOpenMobile(false);
  }

  return (
    <SidebarMenu>
      {navItems.map(({ href, label, icon: Icon }) => (
        <SidebarMenuItem key={label} >
          <SidebarMenuButton
            asChild
            isActive={pathname === href}
            className="w-full"
            tooltip={label}
          >
            <LoadingLink href={href} onClick={handleLinkClick}>
              <Icon />
              <span>{label}</span>
            </LoadingLink>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </SidebarMenu>
  );
}
