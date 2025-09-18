
'use client';

import { Ticket } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";


export default function FloatingSpinButton() {
    const { user } = useAuth();

    if (!user) {
        return null;
    }
    
    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <Link href="/spin" passHref>
                        <Button 
                            variant="default"
                            className={cn(
                                "fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-lg flex items-center justify-center",
                                "bg-accent hover:bg-accent/90 text-accent-foreground",
                                "animate-pulse-glow"
                            )}
                            aria-label="Spin and Win"
                        >
                            <Ticket className="h-8 w-8" />
                        </Button>
                    </Link>
                </TooltipTrigger>
                <TooltipContent side="left">
                    <p>Daily Spin &amp; Win!</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}
