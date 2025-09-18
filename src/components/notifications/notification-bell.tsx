
'use client';

import { useState, useEffect, useMemo } from 'react';
import { Bell, Circle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/use-auth';
import { getNotifications, markNotificationAsRead } from '@/lib/notifications';
import { Notification } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { ScrollArea } from '../ui/scroll-area';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    if (user) {
      const fetchNotifications = async () => {
        const userNotifications = await getNotifications(user.email);
        setNotifications(userNotifications);
      };
      
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 5000); // Poll for new notifications every 5 seconds

      return () => clearInterval(interval);
    }
  }, [user]);

  const handleMarkAsRead = async (id: string) => {
    if (!user) return;

    await markNotificationAsRead(id, user.email);
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };
  
  const unreadCount = useMemo(() => {
      return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  if (!user) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-accent"></span>
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="end">
        <DropdownMenuLabel>Notifications</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <ScrollArea className="h-[300px]">
          {notifications.length > 0 ? (
            notifications.map(notification => (
              <DropdownMenuItem
                key={notification.id}
                className={cn("flex items-start gap-3 whitespace-pre-wrap", !notification.isRead && "font-bold")}
                onClick={() => handleMarkAsRead(notification.id)}
              >
                {!notification.isRead && (
                    <Circle className="h-2 w-2 mt-1.5 fill-accent text-accent" />
                )}
                <div className={cn("flex-1", notification.isRead && "ml-[14px]")}>
                    <p className="text-sm leading-snug">{notification.message}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                        {formatDistanceToNow(new Date(notification.date), { addSuffix: true })}
                    </p>
                </div>
              </DropdownMenuItem>
            ))
          ) : (
            <div className="text-center text-sm text-muted-foreground p-4">
              No new notifications
            </div>
          )}
        </ScrollArea>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
