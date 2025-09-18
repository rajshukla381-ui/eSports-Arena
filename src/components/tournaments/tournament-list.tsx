
'use client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Tournament } from '@/lib/types';
import TournamentCard from './tournament-card';
import Link from 'next/link';
import AdBanner from '../ads/ad-banner';

type TournamentListProps = {
  tournaments: Tournament[];
  activeTournamentId: string | null;
};

export default function TournamentList({
  tournaments,
  activeTournamentId,
}: TournamentListProps) {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">Upcoming Tournaments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-4 h-[75vh] overflow-y-auto pr-2">
          {tournaments.map((tournament) => (
            <Link
              key={tournament.id}
              href={`/?tournamentId=${tournament.id}`}
              className="block"
              scroll={false}
            >
              <TournamentCard
                tournament={tournament}
                isActive={tournament.id === activeTournamentId}
              />
            </Link>
          ))}
          <AdBanner />
        </div>
      </CardContent>
    </Card>
  );
}
