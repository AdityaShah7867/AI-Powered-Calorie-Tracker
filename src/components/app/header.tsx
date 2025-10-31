'use client';

import Link from 'next/link';
import { useUser } from '@/firebase';
import { Logo } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { User as UserIcon, History } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
  } from "@/components/ui/dropdown-menu"

export function AppHeader() {
    const { user } = useUser();
    
  return (
    <header className="flex items-center justify-between gap-4 border-b bg-card p-4">
        <Link href="/" className="flex items-center gap-2">
            <Logo className="h-6 w-6 text-primary" />
            <h1 className="font-headline text-xl font-bold tracking-tight text-foreground">
            CalorieWise AI
            </h1>
        </Link>
      {user && (
        <div className='flex items-center gap-2'>
            <Link href="/history">
                <Button variant="ghost" size="icon">
                    <History className="h-5 w-5" />
                    <span className="sr-only">History</span>
                </Button>
            </Link>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                        <Avatar className="h-8 w-8">
                        <AvatarImage src={user.photoURL || undefined} alt={user.displayName || user.email || ''} />
                        <AvatarFallback>
                            <UserIcon className="h-5 w-5" />
                        </AvatarFallback>
                        </Avatar>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                            <p className="text-sm font-medium leading-none">{user.displayName}</p>
                            <p className="text-xs leading-none text-muted-foreground">
                                {user.email}
                            </p>
                        </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                       <Link href="/profile">Profile</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                     <DropdownMenuItem disabled>Logout (coming soon)</DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
      )}
    </header>
  );
}
