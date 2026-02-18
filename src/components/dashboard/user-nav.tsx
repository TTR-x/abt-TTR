
'use client';

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuSub,
    DropdownMenuSubTrigger,
    DropdownMenuPortal,
    DropdownMenuSubContent
} from "@/components/ui/dropdown-menu";
import type { Ambassador } from "@/lib/api";
import { logout } from "@/app/actions";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import LoadingLink from "@/components/loading-link";
import { useTheme } from "next-themes";
import { LogOut, Moon, Settings, Sun, User } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

interface UserNavProps extends React.HTMLAttributes<HTMLDivElement> {
    user: Ambassador;
    variant?: "default" | "header";
}

export function UserNav({ user, className, variant = "default", ...props }: UserNavProps) {
    const { setTheme } = useTheme();
    const { state } = useSidebar();

    // Mode compact si demandé explicitement (header) ou si la sidebar est repliée
    const isCompact = variant === 'header' || state === "collapsed";

    const UserAvatar = () => (
        <Avatar className="h-8 w-8 cursor-pointer">
            {/* On n'affiche pas l'image pour privilégier l'initiale comme demandé, 
          sauf si on implémente plus tard un upload d'image perso. 
          Pour l'instant, user.avatarUrl est souvent une image aléatoire à ignorer. */}
            {/* <AvatarImage src={user.avatarUrl} alt={user.name} /> */}
            <AvatarFallback className="bg-primary text-primary-foreground font-semibold">
                {user.name?.charAt(0).toUpperCase() || 'U'}
            </AvatarFallback>
        </Avatar>
    );

    if (isCompact) {
        return (
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full p-0">
                        <UserAvatar />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.name}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuGroup>
                        <DropdownMenuItem asChild>
                            <LoadingLink href="/dashboard" className="cursor-pointer"><User className="mr-2 h-4 w-4" />Profil</LoadingLink>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                            <LoadingLink href="/dashboard/settings" className="cursor-pointer"><Settings className="mr-2 h-4 w-4" />Paramètres</LoadingLink>
                        </DropdownMenuItem>
                        <DropdownMenuSub>
                            <DropdownMenuSubTrigger>
                                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                                <span className="ml-2">Thème</span>
                            </DropdownMenuSubTrigger>
                            <DropdownMenuPortal>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onClick={() => setTheme("light")}>
                                        Clair
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                                        Sombre
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => setTheme("system")}>
                                        Système
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuPortal>
                        </DropdownMenuSub>
                    </DropdownMenuGroup>
                    <DropdownMenuSeparator />
                    <form action={logout}>
                        <DropdownMenuItem asChild>
                            <button type="submit" className="w-full text-left cursor-pointer text-red-600 focus:text-red-600">
                                <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
                            </button>
                        </DropdownMenuItem>
                    </form>
                </DropdownMenuContent>
            </DropdownMenu>
        );
    }

    // Mode Sidebar étendu (par défaut)
    return (
        <div className={cn("flex w-full items-center gap-2 rounded-md p-1", className)} {...props}>
            <UserAvatar />
            <div className="flex flex-col text-sm overflow-hidden">
                <span className="font-semibold text-sidebar-foreground truncate">{user.name}</span>
                <span className="text-xs text-sidebar-foreground/70 truncate">{user.email}</span>
            </div>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="ml-auto h-8 w-8 shrink-0">
                        <Settings className="text-sidebar-foreground/70 h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuItem asChild>
                        <LoadingLink href="/dashboard/settings"><Settings className="mr-2 h-4 w-4" />Paramètres</LoadingLink>
                    </DropdownMenuItem>
                    <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                            <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                            <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                            <span className="ml-2">Thème</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                            <DropdownMenuSubContent>
                                <DropdownMenuItem onClick={() => setTheme("light")}>
                                    Clair
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("dark")}>
                                    Sombre
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => setTheme("system")}>
                                    Système
                                </DropdownMenuItem>
                            </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                    </DropdownMenuSub>
                    <DropdownMenuSeparator />
                    <form action={logout}>
                        <DropdownMenuItem asChild>
                            <button type="submit" className="w-full text-left text-red-600 focus:text-red-600">
                                <LogOut className="mr-2 h-4 w-4" /> Se déconnecter
                            </button>
                        </DropdownMenuItem>
                    </form>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
