
'use client';

import { Swords, User, Shield, LogOut } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '../ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { signOut, auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Skeleton } from '../ui/skeleton';

export function Header() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const adminEmail = "rajshukla381@gmail.com";
  const isAdmin = user?.email === adminEmail;

  const handleSignOut = async () => {
    await signOut(auth);
    router.push('/login');
  };

  if (loading) {
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
                <div className="flex flex-1 items-center justify-end">
                    <Skeleton className="h-10 w-10 rounded-full" />
                </div>
            </div>
      </header>
    )
  }

  if (!user) {
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
                <div className="flex flex-1 items-center justify-end">
                    <Button asChild>
                        <Link href="/login">Sign In</Link>
                    </Button>
                </div>
            </div>
      </header>
    )
  }


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
        <div className="flex flex-1 items-center justify-end">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="relative h-10 w-10 rounded-full"
              >
                <Avatar>
                  {user.photoURL && (
                    <AvatarImage
                      src={user.photoURL}
                      alt={user.displayName ?? 'User Avatar'}
                    />
                  )}
                  <AvatarFallback>{user.displayName?.[0]}</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{isAdmin ? "Admin" : user.displayName}</p>
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
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleSignOut}>
                <LogOut className="mr-2 h-4 w-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
