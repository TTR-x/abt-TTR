
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
}

export function UserNav({ user, className, ...props }: UserNavProps) {
  const userAvatar = PlaceHolderImages.find(img => img.id === 'user-avatar');
  const { setTheme } = useTheme();
  const { state } = useSidebar();

  if (state === "collapsed") {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-9 w-9 rounded-full">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={userAvatar?.imageUrl} alt={user.name} data-ai-hint={userAvatar?.imageHint} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
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
                        <LoadingLink href="/dashboard"><User/>Profil</LoadingLink>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <LoadingLink href="/dashboard/settings"><Settings />Paramètres</LoadingLink>
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
                    <button type="submit" className="w-full text-left">
                     <LogOut /> Se déconnecter
                    </button>
                  </DropdownMenuItem>
                </form>
            </DropdownMenuContent>
        </DropdownMenu>
    );
  }

  return (
    <div className={cn("flex w-full items-center gap-2 rounded-md p-1", className)} {...props}>
        <Avatar className="h-9 w-9">
            <AvatarImage src={userAvatar?.imageUrl} alt={user.name} data-ai-hint={userAvatar?.imageHint} />
            <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col text-sm">
            <span className="font-semibold text-sidebar-foreground">{user.name}</span>
            <span className="text-xs text-sidebar-foreground/70">{user.email}</span>
        </div>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="ml-auto h-8 w-8">
                  <Settings className="text-sidebar-foreground/70" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuItem asChild>
                  <LoadingLink href="/dashboard/settings"><Settings />Paramètres</LoadingLink>
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
                    <button type="submit" className="w-full text-left">
                     <LogOut /> Se déconnecter
                    </button>
                  </DropdownMenuItem>
                </form>
            </DropdownMenuContent>
        </DropdownMenu>
    </div>
  )
}
