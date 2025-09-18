
'use client';

import { Swords, User, Shield, LogOut, Ticket } from 'lucide-react';
import { Button } from '../ui/button';
import Link from 'next/link';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { placeholderImages } from '@/lib/placeholder-images.json';
import { useAuth } from '@/hooks/use-auth';

export function Header() {
  const userAvatar = placeholderImages.find(p => p.id === 'user-avatar');
  const { user, signOut } = useAuth();
  const isAdmin = user?.email === 'rajshukla381@gmail.com';

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
            <Link href="/" className='flex items-center gap-2'>
                <Swords className="h-8 w-8 mr-2 text-primary" />
                <h1 className="text-2xl font-bold text-glow-primary tracking-wider">
                    eSports Arena
                </h1>
            </Link>
        </div>
        <div className="flex flex-1 items-center justify-end gap-4">
          { user && (
            <>
              <Link href="/spin" passHref>
                <Button variant="outline" className="gap-2">
                  <Ticket className="w-5 h-5 text-accent" />
                  <span className="hidden sm:inline">Spin & Win</span>
                </Button>
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-10 w-10 rounded-full"
                  >
                    <Avatar>
                        <AvatarImage
                          src={userAvatar?.imageUrl}
                          alt="User Avatar"
                          data-ai-hint={userAvatar?.imageHint}
                        />
                      <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{isAdmin ? 'Admin' : 'Player'}</p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                    {isAdmin && (
                      <Link href="/admin" passHref>
                          <DropdownMenuItem>
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin Panel</span>
                          </DropdownMenuItem>
                      </Link>
                    )}
                  <Link href="/profile" passHref>
                    <DropdownMenuItem>
                      <User className="mr-2 h-4 w-4" />
                      <span>Profile & Create</span>
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={signOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Sign Out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
