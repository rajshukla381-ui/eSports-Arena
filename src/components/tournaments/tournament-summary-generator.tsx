
'use client';

import { useState, useTransition } from 'react';
import { Tournament } from '@/lib/types';
import { Button } from '../ui/button';
import { Sparkles, Bot } from 'lucide-react';
import { generateTournamentSummary } from '@/ai/flows/generate-tournament-summary';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '../ui/skeleton';
import { Badge } from '../ui/badge';

type TournamentSummaryGeneratorProps = {
  tournament: Tournament;
};

export default function TournamentSummaryGenerator({
  tournament,
}: TournamentSummaryGeneratorProps) {
  const [isPending, startTransition] = useTransition();
  const [summary, setSummary] = useState<string | null>(null);
  const { toast } = useToast();

  const handleGenerateSummary = () => {
    startTransition(async () => {
      const result = await generateTournamentSummary({
        title: tournament.title,
        gameName: tournament.gameName,
        prizePool: tournament.prizePool,
        host: tournament.host,
        rules: tournament.rules,
        matchTime: tournament.matchTime,
      });

      if (result.summary) {
        setSummary(result.summary);
      } else {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'Could not generate tournament summary.',
        });
      }
    });
  };

  if (summary === null && !isPending) {
    return (
      <Button onClick={handleGenerateSummary} disabled={isPending} className="w-full">
        <Sparkles className="mr-2 h-4 w-4" />
        Generate AI Summary
      </Button>
    );
  }

  return (
    <div className="space-y-2">
      <h4 className="font-semibold text-lg flex items-center gap-2">
        <Bot className="text-primary"/> AI Summary
      </h4>
      <div className="p-4 bg-primary/10 border-l-4 border-primary rounded-r-lg">
        {isPending ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
          </div>
        ) : (
          <blockquote className="text-sm italic text-primary-foreground/90">
            "{summary}"
          </blockquote>
        )}
      </div>
    </div>
  );
}
