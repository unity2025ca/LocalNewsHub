
import React, { useState } from "react";
import { Bell } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Notification } from "@shared/schema";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";

export function NotificationsDropdown() {
  const [open, setOpen] = useState(false);
  const [readNotifications, setReadNotifications] = useState<Set<number>>(new Set());
  const [hasOpened, setHasOpened] = useState(false);

  const { data: notifications = [] } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    onSuccess: (data) => {
      // If there are new notifications since last visit, reset the viewed state
      const lastNotificationCount = parseInt(localStorage.getItem('lastNotificationCount') || '0');
      if (data.length > lastNotificationCount) {
        setHasOpened(false);
        localStorage.setItem('hasViewedNotifications', 'false');
      }
      localStorage.setItem('lastNotificationCount', data.length.toString());
    }
  });

  // Store the hasOpened state in localStorage to persist across page reloads
  React.useEffect(() => {
    const hasViewedNotifications = localStorage.getItem('hasViewedNotifications') === 'true';
    if (hasViewedNotifications) {
      setHasOpened(true);
    }
  }, []);

  // Count unread notifications
  const unreadCount = hasOpened ? 0 : (notifications.length - readNotifications.size);

  const markAsRead = (id: number) => {
    setReadNotifications(prev => new Set([...prev, id]));
  };

  const markAllAsRead = () => {
    const allIds = notifications.map(n => n.id);
    setReadNotifications(new Set(allIds));
  };
  
  // When dropdown opens, mark as "opened" to remove the red badge
  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (newOpen) {
      setHasOpened(true);
      // Save to localStorage to persist across page reloads
      localStorage.setItem('hasViewedNotifications', 'true');
    }
  };

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button variant="outline" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-2 -right-2 px-1.5 h-5 min-w-5 flex items-center justify-center bg-red-500 text-white"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold text-lg">Notifications</h3>
          {notifications.length > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-[400px]">
          {notifications.length > 0 ? (
            <div className="space-y-2 p-2">
              {notifications.map((notification) => {
                const isRead = readNotifications.has(notification.id);
                return (
                  <Card 
                    key={notification.id} 
                    className={`cursor-pointer transition-colors ${isRead ? "bg-background" : "bg-muted/20"}`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <CardHeader className="p-3 pb-1">
                      <CardTitle className="text-sm font-medium">{notification.title}</CardTitle>
                      <CardDescription className="text-xs">
                        {new Date(notification.createdAt).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-3 pt-0">
                      <p className="text-sm whitespace-pre-wrap">{notification.message}</p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No notifications
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
