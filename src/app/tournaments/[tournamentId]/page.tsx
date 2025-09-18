
'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { notFound, useRouter } from 'next/navigation';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/hooks/use-auth';
import { getTournamentById, getTournamentParticipants, isUserParticipant, addTournamentParticipant, setTournamentRoomDetails } from '@/lib/data';
import { Tournament, TournamentParticipant, ChatMessage } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CircleDollarSign, Users, Gamepad2, Shield, Lock, Eye, EyeOff, Clipboard, ClipboardCheck } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { addChatMessage, getChatMessages } from '@/lib/chat';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { Send } from 'lucide-react';
import { addNotification } from '@/lib/notifications';

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
                    <Card>
                        <CardHeader>
                            <CardTitle>Results</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Tournament results will be posted here after the match concludes.</p>
                        </CardContent>
                    </Card>
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
                <RoomDetailsCard tournament={tournament} isAdmin={user?.role === 'admin'} onSetRoomDetails={handleSetRoomDetails}/>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

function RoomDetailsCard({ tournament, isAdmin, onSetRoomDetails }: { tournament: Tournament, isAdmin: boolean, onSetRoomDetails: (details: {id: string, pass: string}) => void }) {
    const [roomId, setRoomId] = useState(tournament.roomDetails?.id || '');
    const [roomPass, setRoomPass] = useState(tournament.roomDetails?.pass || '');
    const [showPass, setShowPass] = useState(false);
    const { toast } = useToast();

    const handleCopy = (text: string, label: string) => {
        navigator.clipboard.writeText(text);
        toast({ title: 'Copied!', description: `${label} copied to clipboard.` });
    }

    if (isAdmin) {
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
                    <p className="text-muted-foreground text-center py-4">Room details have not been posted by the admin yet. Please check back later.</p>
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
                                        <p className="text-sm">{msg.message}</p>
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
                    <form onSubmit={handleSendMessage} className="mt-4 flex gap-2">
                        <Input 
                            value={newMessage} 
                            onChange={e => setNewMessage(e.target.value)} 
                            placeholder="Type a message..."
                        />
                        <Button type="submit" size="icon"><Send className="w-4 h-4"/></Button>
                    </form>
                </div>
            </CardContent>
        </Card>
    );
}

