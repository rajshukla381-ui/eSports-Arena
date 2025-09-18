
'use client';

import { Tournament, ChatMessage } from '@/lib/types';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import Image from 'next/image';
import { GameIcon } from '../icons/game-icon';
import { Button } from '../ui/button';
import { Calendar, Clock, CircleDollarSign, Shield, Users, Trophy, MessageSquare, Send } from 'lucide-react';
import TournamentSummaryGenerator from './tournament-summary-generator';
import { format, formatDistanceToNow } from 'date-fns';
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
import { useState, useEffect, useRef, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';
import { isUserParticipant } from '@/lib/data';
import { addChatMessage, getChatMessages } from '@/lib/chat';
import { ScrollArea } from '../ui/scroll-area';

type TournamentDetailsProps = {
  tournament: Tournament;
  onJoin: (tournament: Tournament) => void;
  isAdmin: boolean;
  currentUserEmail: string;
  onDeclareWinner: (tournament: Tournament, winnerEmail: string, prizeAmount: number) => void;
};

export default function TournamentDetails({ tournament, onJoin, isAdmin, currentUserEmail, onDeclareWinner }: TournamentDetailsProps) {
  const [hasJoined, setHasJoined] = useState(false);

  useEffect(() => {
    const checkParticipation = async () => {
        const participating = await isUserParticipant(tournament.id, currentUserEmail);
        setHasJoined(participating);
    };
    checkParticipation();
  }, [tournament.id, currentUserEmail]);

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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-center">
            <InfoChip icon={CircleDollarSign} label="Prize Pool" value={`${tournament.prizePool.toLocaleString()}`} accent />
            <InfoChip icon={Users} label="Entry" value="Free" />
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

        {hasJoined || isAdmin ? (
            <TournamentChat tournamentId={tournament.id} currentUserEmail={currentUserEmail} />
        ) : (
            <Button size="lg" className="w-full font-bold text-lg bg-accent text-accent-foreground hover:bg-accent/90 shadow-glow-accent" onClick={() => onJoin(tournament)}>
                Join Tournament
            </Button>
        )}
        
        {isAdmin && <DeclareWinnerDialog tournament={tournament} onDeclareWinner={onDeclareWinner} />}
      </CardContent>
    </Card>
  );
}

const InfoChip = ({ icon: Icon, label, value, accent=false }: { icon: React.ElementType, label: string, value: string, accent?: boolean }) => (
    <div className="p-3 bg-background rounded-lg border">
        <Icon className={cn("mx-auto h-6 w-6 mb-1", accent ? "text-accent" : "text-primary")} />
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className={cn("font-bold flex items-center justify-center gap-1", accent && "text-accent")}>
          { (label === 'Prize Pool') && <CircleDollarSign className="w-4 h-4"/>}
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
                <Button variant="outline" className="w-full"><Trophy className="mr-2"/> Declare Winner</Button>
            </DialogTrigger>
            <DialogContent>
                 <DialogHeader>
                    <DialogTitle>Declare Winner for {tournament.title}</DialogTitle>
                    <DialogDescription>
                        Enter the winner's email and the prize amount. The points will be credited to the winner.
                    </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="winnerEmail" className="text-right">Winner's Email</Label>
                        <Input id="winnerEmail" type="email" value={winnerEmail} onChange={e => setWinnerEmail(e.target.value)} className="col-span-3" placeholder="winner@example.com" />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="prizeAmount" className="text-right">Prize (Points)</Label>
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

function TournamentChat({ tournamentId, currentUserEmail }: { tournamentId: string, currentUserEmail: string }) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const fetchMessages = useCallback(async () => {
        const fetchedMessages = await getChatMessages(tournamentId);
        setMessages(fetchedMessages);
    }, [tournamentId]);

    useEffect(() => {
        fetchMessages();
        const interval = setInterval(fetchMessages, 2000); // Poll for new messages
        return () => clearInterval(interval);
    }, [fetchMessages]);
    
    useEffect(() => {
        // Scroll to bottom when new messages arrive
        if (scrollAreaRef.current) {
            scrollAreaRef.current.scrollTo({ top: scrollAreaRef.current.scrollHeight });
        }
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (newMessage.trim()) {
            await addChatMessage(tournamentId, currentUserEmail, newMessage);
            setNewMessage('');
            fetchMessages(); // Immediately fetch new messages after sending
        }
    }

    return (
        <div className="space-y-4">
            <h4 className="font-semibold text-lg flex items-center gap-2"><MessageSquare className="text-primary"/> Tournament Chat</h4>
            <div className="p-4 bg-background rounded-md border h-64 flex flex-col">
                <ScrollArea className="flex-1 pr-4" ref={scrollAreaRef}>
                    <div className="space-y-4">
                        {messages.map(msg => (
                            <div key={msg.id} className={cn(
                                "flex items-end gap-2",
                                msg.userId === currentUserEmail ? "justify-end" : "justify-start"
                            )}>
                                <div className={cn(
                                    "rounded-lg px-3 py-2 max-w-xs",
                                    msg.userId === currentUserEmail ? "bg-primary text-primary-foreground" : "bg-muted"
                                )}>
                                    <p className="text-xs font-bold mb-1 truncate max-w-[100px]">{msg.userId.split('@')[0]}</p>
                                    <p className="text-sm">{msg.message}</p>
                                    <p className="text-xs opacity-70 mt-1 text-right">{formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                    <Input 
                        value={newMessage} 
                        onChange={e => setNewMessage(e.target.value)} 
                        placeholder="Type a message..."
                    />
                    <Button type="submit" size="icon"><Send className="w-4 h-4"/></Button>
                </form>
            </div>
        </div>
    );
}

