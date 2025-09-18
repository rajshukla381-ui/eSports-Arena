
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/hooks/use-auth';
import { getTournamentById, getTournamentParticipants, isUserParticipant, addTournamentParticipant, setTournamentRoomDetails, declareTournamentWinners, addTransaction } from '@/lib/data';
import { Tournament, TournamentParticipant, ChatMessage, Winner } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CircleDollarSign, Users, Gamepad2, Shield, Lock, Eye, EyeOff, Clipboard, Trophy, Image as ImageIcon, Send, Trash2, Mic } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { addChatMessage, getChatMessages } from '@/lib/chat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow, format } from 'date-fns';
import { addNotification } from '@/lib/notifications';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose, DialogDescription } from '@/components/ui/dialog';
import { generateVoiceMessage } from '@/ai/flows/generate-voice-message';

export default function TournamentPage({ params }: { params: { tournamentId: string } }) {
  const { tournamentId } = params;
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [tournament, setTournament] = useState<Tournament | null>(null);
  const [participants, setParticipants] = useState<TournamentParticipant[]>([]);
  const [hasJoined, setHasJoined] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchTournamentData = useCallback(async () => {
    if (!user) return;
    const [fetchedTournament, fetchedParticipants, userHasJoined] = await Promise.all([
      getTournamentById(tournamentId),
      getTournamentParticipants(tournamentId),
      isUserParticipant(tournamentId, user.email),
    ]);

    if (!fetchedTournament) {
      notFound();
      return;
    }
    
    setTournament(fetchedTournament);
    setParticipants(fetchedParticipants);
    setHasJoined(userHasJoined || user.role === 'admin');
    setLoading(false);
  }, [tournamentId, user]);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/login');
      return;
    }
    fetchTournamentData();
  }, [authLoading, user, router, fetchTournamentData]);

  const handleJoin = async () => {
    if (!user || !tournament) return;
    await addTournamentParticipant(tournament.id, user.email);
    
    await addNotification({
        userId: user.email,
        message: `You have successfully joined the tournament: "${tournament.title}". Good luck!`,
    });

    toast({
      title: 'Success!',
      description: 'You have joined the tournament.',
    });
    fetchTournamentData();
  };
  
  const handleSetRoomDetails = async (roomDetails: { id: string; pass: string }) => {
    if (!tournament) return;
    await setTournamentRoomDetails(tournament.id, roomDetails);
    toast({
      title: 'Room Details Updated',
      description: 'The Room ID and Password have been set for this tournament.',
    });
    fetchTournamentData(); // Re-fetch to get updated details
  };

  const handleDeclareWinner = async (winners: Winner[]) => {
    if (!tournament) return;

    await declareTournamentWinners(tournament.id, winners);

    for (const winner of winners) {
        await addTransaction({
            userId: winner.email,
            date: new Date().toISOString(),
            description: `Prize for ${tournament.title}`,
            amount: winner.prize,
            type: 'credit',
        });
        await addNotification({
            userId: winner.email,
            message: `Congratulations! You won ${winner.prize.toLocaleString()} points for winning the tournament: "${tournament.title}".`,
        });
    }

    toast({
      title: 'Winners Declared!',
      description: `Prizes have been distributed for ${tournament.title}.`,
    });
    
    fetchTournamentData();
  };

  if (loading || authLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Skeleton className="w-full h-[80vh]" />
        </main>
      </div>
    );
  }

  if (!tournament) {
    return notFound();
  }
  
  if (!hasJoined) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 flex flex-col items-center justify-center p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Join Tournament</CardTitle>
              <CardDescription>You must join this tournament to view the details.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button className="w-full" onClick={handleJoin}>Join "{tournament.title}"</Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const canManageTournament = user?.role === 'admin' || user?.email === tournament.creatorId;

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <Header />
      <main className="flex-1 p-4 sm:p-6 lg:p-8">
        <div className="space-y-4">
          <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden">
            <Image src={tournament.imageUrl} alt={tournament.title} layout="fill" objectFit="cover" data-ai-hint={tournament.imageHint} />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <h1 className="text-3xl md:text-4xl font-bold">{tournament.title}</h1>
              <p className="text-lg flex items-center gap-2"><Gamepad2 /> {tournament.gameName}</p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-6">
              <Tabs defaultValue="chat">
                <TabsList>
                  <TabsTrigger value="chat">Chat</TabsTrigger>
                  <TabsTrigger value="participants">Participants ({participants.length})</TabsTrigger>
                  <TabsTrigger value="results">Results</TabsTrigger>
                </TabsList>
                <TabsContent value="chat">
                  <TournamentChat tournamentId={tournamentId} currentUserEmail={user!.email} />
                </TabsContent>
                <TabsContent value="participants">
                  <ParticipantsList participants={participants} />
                </TabsContent>
                <TabsContent value="results">
                    <ResultsCard tournament={tournament} />
                </TabsContent>
              </Tabs>
            </div>
            <div className="space-y-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2"><CircleDollarSign /> Prize Pool</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-4xl font-bold text-accent text-glow-accent">{tournament.prizePool.toLocaleString()} Points</p>
                    </CardContent>
                </Card>
                <RoomDetailsCard tournament={tournament} canEdit={canManageTournament} onSetRoomDetails={handleSetRoomDetails}/>
                {canManageTournament && <DeclareWinnerDialog tournament={tournament} onDeclareWinner={handleDeclareWinner} />}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function RoomDetailsCard({ tournament, canEdit, onSetRoomDetails }: { tournament: Tournament, canEdit: boolean, onSetRoomDetails: (details: {id: string, pass: string}) => void }) {
    const [roomId, setRoomId] = useState(tournament.roomDetails?.id || '');
    const [roomPass, setRoomPass] = useState(tournament.roomDetails?.pass || '');
    const [showPass, setShowPass] = useState(false);
    const { toast } = useToast();

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Copied!', description: `${label} copied to clipboard.` });
    }

    if (canEdit) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2"><Shield /> Room Credentials</CardTitle>
                    <CardDescription>Enter the Room ID and Password to share with participants.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label htmlFor="roomId">Room ID</Label>
                        <Input id="roomId" value={roomId} onChange={e => setRoomId(e.target.value)} placeholder="Enter Room ID" />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="roomPass">Room Password</Label>
                        <Input id="roomPass" value={roomPass} onChange={e => setRoomPass(e.target.value)} placeholder="Enter Room Password" />
                    </div>
                    <Button className="w-full" onClick={() => onSetRoomDetails({ id: roomId, pass: roomPass })}>Set Credentials</Button>
                </CardContent>
            </Card>
        );
    }
    
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><Lock /> Room Credentials</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {tournament.roomDetails ? (
                    <>
                        <div className="space-y-2">
                            <Label>Room ID</Label>
                            <div className="flex items-center gap-2">
                                <Input value={tournament.roomDetails.id} readOnly />
                                <Button size="icon" variant="ghost" onClick={() => handleCopy(tournament.roomDetails!.id, 'Room ID')}>
                                    <Clipboard className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                         <div className="space-y-2">
                            <Label>Room Password</Label>
                             <div className="flex items-center gap-2">
                                <Input value={tournament.roomDetails.pass} readOnly type={showPass ? 'text' : 'password'} />
                                <Button size="icon" variant="ghost" onClick={() => setShowPass(!showPass)}>
                                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </Button>
                                <Button size="icon" variant="ghost" onClick={() => handleCopy(tournament.roomDetails!.pass, 'Room Password')}>
                                    <Clipboard className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </>
                ) : (
                    <p className="text-muted-foreground text-center py-4">Room details have not been posted by the admin or creator yet. Please check back later.</p>
                )}
            </CardContent>
        </Card>
    );
}

function ParticipantsList({ participants }: { participants: TournamentParticipant[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Users /> Participants</CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-72">
            <div className="space-y-2">
                {participants.map(p => (
                    <div key={p.userId} className="flex items-center justify-between p-2 bg-muted/50 rounded-md">
                        <p className="text-sm font-medium">{p.userId}</p>
                        <p className="text-xs text-muted-foreground">Joined</p>
                    </div>
                ))}
            </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
}


function TournamentChat({ tournamentId, currentUserEmail }: { tournamentId: string, currentUserEmail: string }) {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

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

    const handleSendMessage = async (e: React.FormEvent, imageUrl?: string, voiceUrl?: string) => {
        e.preventDefault();
        if (isSending) return;

        if (newMessage.trim() || imageUrl || voiceUrl) {
            setIsSending(true);
            try {
                await addChatMessage(tournamentId, currentUserEmail, newMessage, imageUrl, voiceUrl);
                setNewMessage('');
                fetchMessages(); // Immediately fetch new messages after sending
            } catch (error) {
                 toast({ variant: 'destructive', title: 'Error Sending Message', description: 'Could not send the message. Please try again.' });
            } finally {
                setIsSending(false);
            }
        }
    }
    
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 2 * 1024 * 1024) { // 2MB limit
                toast({ variant: 'destructive', title: 'Image too large', description: 'Please upload an image smaller than 2MB.'});
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                handleSendMessage(e, reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSendVoiceMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || isSending) return;

        setIsSending(true);
        toast({ title: 'Generating voice message...', description: 'Please wait a moment.' });
        try {
            const voiceUrl = await generateVoiceMessage(newMessage);
            await handleSendMessage(e, undefined, voiceUrl);
        } catch (error) {
            console.error('Error generating voice message:', error);
            toast({ variant: 'destructive', title: 'Voice Message Failed', description: 'Could not generate the voice message.' });
        } finally {
            setIsSending(false);
        }
    };


    return (
        <Card>
            <CardHeader>
                <CardTitle>Tournament Chat</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-96 flex flex-col">
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
                                        
                                        {msg.voiceUrl ? (
                                            <audio controls src={msg.voiceUrl} className="w-full h-10" />
                                        ) : msg.message ? (
                                            <p className="text-sm whitespace-pre-wrap">{msg.message}</p>
                                        ) : null}

                                        {msg.imageUrl && (
                                            <Image src={msg.imageUrl} alt="Chat image" width={200} height={200} className="rounded-md mt-2" />
                                        )}
                                        <p className="text-xs opacity-70 mt-1 text-right">{formatDistanceToNow(new Date(msg.timestamp), { addSuffix: true })}</p>
                                    </div>
                                </div>
                            ))}
                             {messages.length === 0 && (
                                <div className="text-center text-muted-foreground pt-16">
                                    No messages yet. Be the first to say something!
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                    <form className="mt-4 flex gap-2" onSubmit={(e) => handleSendMessage(e)}>
                        <Input
                            id="image-upload"
                            type="file"
                            accept="image/*"
                            ref={fileInputRef}
                            onChange={handleImageUpload}
                            className="hidden"
                        />
                         <Button type="button" size="icon" variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isSending}>
                            <ImageIcon className="w-4 h-4"/>
                        </Button>
                        <Input 
                            value={newMessage} 
                            onChange={e => setNewMessage(e.target.value)} 
                            placeholder="Type a message..."
                            disabled={isSending}
                        />
                         <Button type="button" size="icon" onClick={handleSendVoiceMessage} disabled={isSending || !newMessage.trim()}>
                            <Mic className="w-4 h-4"/>
                        </Button>
                        <Button type="submit" size="icon" disabled={isSending}><Send className="w-4 h-4"/></Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}

function DeclareWinnerDialog({ tournament, onDeclareWinner }: { tournament: Tournament, onDeclareWinner: (winners: Winner[]) => void }) {
    const [open, setOpen] = useState(false);
    const [winners, setWinners] = useState<Winner[]>([{ email: '', prize: 0 }]);
    const { toast } = useToast();

    const handleAddWinner = () => {
        setWinners([...winners, { email: '', prize: 0 }]);
    }
    
    const handleWinnerChange = (index: number, field: 'email' | 'prize', value: string) => {
        const newWinners = [...winners];
        if (field === 'prize') {
            newWinners[index][field] = parseInt(value) || 0;
        } else {
            newWinners[index][field] = value;
        }
        setWinners(newWinners);
    }
    
    const handleRemoveWinner = (index: number) => {
        const newWinners = winners.filter((_, i) => i !== index);
        setWinners(newWinners);
    }

    const totalPrizeAllocated = winners.reduce((sum, w) => sum + w.prize, 0);

    const handleConfirm = () => {
        for (const winner of winners) {
            if (!winner.email || !/^\S+@\S+\.\S+$/.test(winner.email)) {
                toast({ variant: 'destructive', title: 'Invalid Email', description: `Please enter a valid email for all winners.` });
                return;
            }
            if (winner.prize <= 0) {
                toast({ variant: 'destructive', title: 'Invalid Prize', description: `Prize for ${winner.email} must be greater than zero.` });
                return;
            }
        }
        
        if (totalPrizeAllocated > tournament.prizePool) {
             toast({ variant: 'destructive', title: 'Prize Pool Exceeded', description: `Total allocated prize (${totalPrizeAllocated.toLocaleString()}) exceeds the tournament prize pool (${tournament.prizePool.toLocaleString()}).` });
            return;
        }

        onDeclareWinner(winners);
        setOpen(false);
        setWinners([{ email: '', prize: 0 }]);
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="w-full"><Trophy className="mr-2"/> Declare Winners</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
                 <DialogHeader>
                    <DialogTitle>Declare Winners for {tournament.title}</DialogTitle>
                    <DialogDescription>
                        Enter the winners' emails and their prize amounts. The points will be credited to each winner.
                        The total prize cannot exceed the tournament prize pool of {tournament.prizePool.toLocaleString()} points.
                    </DialogDescription>
                </DialogHeader>
                <ScrollArea className="max-h-[50vh] pr-4">
                    <div className="space-y-4 py-4">
                        {winners.map((winner, index) => (
                            <div key={index} className="grid grid-cols-12 items-center gap-2 p-2 rounded-md border">
                                <div className="col-span-6">
                                    <Label htmlFor={`winnerEmail-${index}`} className="sr-only">Winner's Email</Label>
                                    <Input id={`winnerEmail-${index}`} type="email" value={winner.email} onChange={e => handleWinnerChange(index, 'email', e.target.value)} placeholder="winner@example.com" />
                                </div>
                                <div className="col-span-5">
                                    <Label htmlFor={`prizeAmount-${index}`} className="sr-only">Prize (Points)</Label>
                                    <Input id={`prizeAmount-${index}`} type="number" value={winner.prize || ''} onChange={e => handleWinnerChange(index, 'prize', e.target.value)} placeholder="Prize amount" />
                                </div>
                                 <div className="col-span-1">
                                    {winners.length > 1 && (
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveWinner(index)}>
                                            <Trash2 className="w-4 h-4 text-destructive"/>
                                        </Button>
                                    )}
                                 </div>
                            </div>
                        ))}
                    </div>
                </ScrollArea>
                 <Button variant="outline" onClick={handleAddWinner} className="mt-2">Add Another Winner</Button>
                 <div className="text-right font-medium mt-2">
                    Total Allocated: <span className={cn(totalPrizeAllocated > tournament.prizePool ? 'text-destructive' : 'text-accent')}>{totalPrizeAllocated.toLocaleString()}</span> / {tournament.prizePool.toLocaleString()}
                 </div>
                <DialogFooter>
                    <DialogClose asChild>
                        <Button variant="outline">Cancel</Button>
                    </DialogClose>
                    <Button onClick={handleConfirm}>Confirm Winners</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

function ResultsCard({ tournament }: { tournament: Tournament }) {
    if (!tournament.results || tournament.results.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Results</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-muted-foreground">Tournament results will be posted here after the match concludes.</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>🏆 Final Results</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {tournament.results.sort((a,b) => b.prize - a.prize).map((winner, index) => (
                        <div key={winner.email} className="flex items-center justify-between p-3 rounded-md bg-muted/50">
                            <div className="flex items-center gap-3">
                                <span className="text-xl font-bold w-6 text-center">{index + 1}</span>
                                <p className="font-medium">{winner.email}</p>
                            </div>
                            <p className="font-bold text-accent text-glow-accent flex items-center gap-1">
                                <CircleDollarSign className="w-5 h-5" />
                                {winner.prize.toLocaleString()}
                            </p>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
