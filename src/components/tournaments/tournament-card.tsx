
'use client';
import Image from 'next/image';
import type { Tournament } from '@/lib/types';
import { cn } from '@/lib/utils';
import { GameIcon } from '../icons/game-icon';
import { Badge } from '../ui/badge';
import { CircleDollarSign } from 'lucide-react';
import Link from 'next/link';

type TournamentCardProps = {
  tournament: Tournament;
  isActive: boolean;
};

export default function TournamentCard({
  tournament,
  isActive,
}: TournamentCardProps) {
  return (
    <Link href={`/?tournamentId=${tournament.id}`} scroll={false}>
      <div
        className={cn(
          'group rounded-lg bg-card border-2 border-transparent transition-all duration-300 ease-in-out cursor-pointer overflow-hidden',
          isActive
            ? 'border-primary shadow-glow-primary'
            : 'hover:border-primary/50 hover:shadow-glow-primary'
        )}
      >
        <div className="relative">
          <Image
            src={tournament.imageUrl}
            alt={tournament.title}
            width={400}
            height={200}
            className="w-full h-24 object-cover transition-transform duration-300 group-hover:scale-105"
            data-ai-hint={tournament.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card to-transparent" />
          <div className="absolute bottom-2 left-3 flex items-center gap-2">
            <div className="p-2 bg-card/80 backdrop-blur-sm rounded-md">
              <GameIcon gameName={tournament.gameName} className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-lg font-bold text-white drop-shadow-md">{tournament.title}</h3>
          </div>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex justify-between items-center">
              <div>
              <p className="text-sm text-muted-foreground">Prize Pool</p>
              <p className="text-lg font-bold text-accent text-glow-accent flex items-center gap-1">
                  <CircleDollarSign className="w-5 h-5"/>
                  {tournament.prizePool.toLocaleString()}
              </p>
              </div>
              <Badge variant="secondary">Free to Join</Badge>
          </div>
        </div>
      </div>
    </Link>
  );
}
