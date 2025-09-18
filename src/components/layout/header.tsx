import { Swords } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { placeholderImages } from '@/lib/placeholder-images.json';

const userAvatar = placeholderImages.find(p => p.id === 'user-avatar');

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-4 flex items-center">
          <Swords className="h-8 w-8 mr-2 text-primary" />
          <h1 className="text-2xl font-bold text-glow-primary tracking-wider">
            eSports Arena
          </h1>
        </div>
        <div className="flex flex-1 items-center justify-end">
          <Avatar>
            {userAvatar && <AvatarImage src={userAvatar.imageUrl} alt="User Avatar" data-ai-hint={userAvatar.imageHint} />}
            <AvatarFallback>AV</AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
