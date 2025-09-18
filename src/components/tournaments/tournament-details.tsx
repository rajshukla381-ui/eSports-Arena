
'use client';

import { Tournament } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import { GameIcon } from '../icons/game-icon';
import { Button } from '../ui/button';
import { Calendar, Clock, CircleDollarSign, Shield, Users, Trophy } from 'lucide-react';
import TournamentSummaryGenerator from './tournament-summary-generator';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';

type TournamentDetailsProps = {
  tournament: Tournament;
  onJoin: (tournament: Tournament) => void;
  isAdmin: boolean;
  onDeclareWinner: (tournament: Tournament, winnerEmail: string, prizeAmount: number) => void;
};

export default function TournamentDetails({ tournament, onJoin, isAdmin, onDeclareWinner }: TournamentDetailsProps) {
  return (
    <Card className="h-full overflow-auto">
      <CardHeader className="p-0">
        <div className="relative">
          <Image
            src={tournament.imageUrl}
            alt={tournament.title}
            width={600}
            height={300}
            className="w-full h-48 object-cover"
            data-ai-hint={tournament.imageHint}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-card via-card/70 to-transparent" />
          <div className="absolute bottom-4 left-6">
            <h2 className="text-3xl font-bold text-white drop-shadow-lg">
              {tournament.title}
            </h2>
          </div>
          <div className="absolute top-4 right-4 p-2 bg-card/80 backdrop-blur-sm rounded-md">
             <GameIcon gameName={tournament.gameName} className="w-8 h-8 text-primary" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <InfoChip icon={CircleDollarSign} label="Prize Pool" value={`${tournament.prizePool.toLocaleString()}`} accent />
            <InfoChip icon={Users} label="Entry Fee" value={`${tournament.entryFee.toLocaleString()}`} />
            <InfoChip icon={Calendar} label="Date" value={format(new Date(tournament.matchTime), "MMM dd")} />
            <InfoChip icon={Clock} label="Time" value={format(new Date(tournament.matchTime), "h:mm a")} />
        </div>
        
        <TournamentSummaryGenerator tournament={tournament} />

        <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2"><Shield className="text-primary"/> Rules & Info</h4>
            <div className="text-sm text-muted-foreground p-4 bg-background rounded-md border">
              <p className="whitespace-pre-wrap">{tournament.rules}</p>
              <p className="mt-4"><strong>Host:</strong> {tournament.host}</p>
            </div>
        </div>
        
        <div className="flex gap-4">
          <Button size="lg" className="w-full font-bold text-lg bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow-accent" onClick={() => onJoin(tournament)}>
            Join Tournament
          </Button>
          {isAdmin && <DeclareWinnerDialog tournament={tournament} onDeclareWinner={onDeclareWinner} />}
        </div>
      </CardContent>
    </Card>
  );
}

const InfoChip = ({ icon: Icon, label, value, accent=false }: { icon: React.ElementType, label: string, value: string, accent?: boolean }) => (
    <div className="p-3 bg-background rounded-lg border">
        <Icon className={cn("mx-auto h-6 w-6 mb-1", accent ? "text-accent" : "text-primary")} />
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("font-bold flex items-center justify-center gap-1", accent && "text-accent")}>
          { (label === 'Prize Pool' || label === 'Entry Fee') && <CircleDollarSign className="w-4 h-4"/>}
          {value}
        </p>
    </div>
)

function DeclareWinnerDialog({ tournament, onDeclareWinner }: { tournament: Tournament, onDeclareWinner: TournamentDetailsProps['onDeclareWinner'] }) {
    const [open, setOpen] = useState(false);
    const [winnerEmail, setWinnerEmail] = useState('');
    const [prizeAmount, setPrizeAmount] = useState(tournament.prizePool.toString());
    const { toast } = useToast();

    const handleConfirm = () => {
        const prize = parseInt(prizeAmount);
        if (!winnerEmail || !/^\S+@\S+\.\S+$/.test(winnerEmail)) {
            toast({ variant: 'destructive', title: 'Invalid Email', description: 'Please enter a valid winner email.' });
            return;
        }
        if (isNaN(prize) || prize <= 0) {
            toast({ variant: 'destructive', title: 'Invalid Prize', description: 'Please enter a valid prize amount.' });
            return;
        }

        onDeclareWinner(tournament, winnerEmail, prize);
        setOpen(false);
        setWinnerEmail('');
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full" size="lg"><Trophy className="mr-2"/> Declare Winner</Button>
            </DialogTrigger>
            <DialogContent>
                 <DialogHeader>
                    <DialogTitle>Declare Winner for {tournament.title}</DialogTitle>
                    <DialogDescription>
                        Enter the winner's email and the prize amount. The coins will be credited to the winner.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="winnerEmail" className="text-right">Winner's Email</Label>
                        <Input id="winnerEmail" type="email" value={winnerEmail} onChange={e => setWinnerEmail(e.target.value)} className="col-span-3" placeholder="winner@example.com" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="prizeAmount" className="text-right">Prize (Coins)</Label>
                        <Input id="prizeAmount" type="number" value={prizeAmount} onChange={e => setPrizeAmount(e.target.value)} className="col-span-3" />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleConfirm}>Confirm Winner</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
