import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { News, Notification, Weather, AdSettings } from "@shared/schema";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Cloud,
  LogOut,
  MessageSquare,
  Settings,
  Sun,
  Newspaper,
} from "lucide-react";
import React, { useState } from 'react';

// New component for the notifications dropdown
const NotificationsDropdown = ({ notifications }: { notifications: Notification[] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewedNotifications, setViewedNotifications] = useState<Set<number>>(new Set());
  const [lastViewTime, setLastViewTime] = useState<number>(
    // Get last view time from localStorage or default to current time
    parseInt(localStorage.getItem('lastNotificationViewTime') || Date.now().toString())
  );
  
  // Track which notifications are new (arrived after last view)
  const newNotifications = React.useMemo(() => {
    return notifications.filter(notification => {
      const notificationTime = new Date(notification.createdAt).getTime();
      return notificationTime > lastViewTime;
    });
  }, [notifications, lastViewTime]);
  
  // Mark specific notification as viewed
  const markAsViewed = (notificationId: number) => {
    setViewedNotifications(prev => {
      const newSet = new Set(prev);
      newSet.add(notificationId);
      return newSet;
    });
  };
  
  // Handle opening the dropdown
  const handleToggle = () => {
    const newIsOpen = !isOpen;
    setIsOpen(newIsOpen);
    
    // If opening the dropdown, update the last view time
    if (newIsOpen) {
      const currentTime = Date.now();
      setLastViewTime(currentTime);
      localStorage.setItem('lastNotificationViewTime', currentTime.toString());
      
      // Mark all current notifications as viewed
      const newViewedSet = new Set(viewedNotifications);
      newNotifications.forEach(notification => {
        newViewedSet.add(notification.id);
      });
      setViewedNotifications(newViewedSet);
    }
  };

  // Count unread notifications (only those that arrived after last view and haven't been individually viewed)
  const unreadCount = newNotifications.filter(n => !viewedNotifications.has(n.id)).length;

  return (
    <div className="relative">
      <Button onClick={handleToggle} variant="ghost" size="sm">
        <MessageSquare className="h-4 w-4 mr-2" />
        Notifications {unreadCount > 0 && <span className="bg-red-500 text-white text-xs rounded-full px-1 ml-1">{unreadCount}</span>}
      </Button>
      {isOpen && (
        <div className="absolute right-0 mt-2 py-2 w-48 bg-white rounded-md shadow-lg">
          <div className="max-h-48 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div key={notification.id} className="p-2 border-b">
                  <p className="text-sm">{notification.title}</p>
                  <p className="text-xs text-gray-500">{notification.message}</p>
                </div>
              ))
            ) : (
              <div className="p-2 text-center text-gray-500">No notifications</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};


export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  const { data: news } = useQuery<News[]>({
    queryKey: ["/api/news"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const { data: weather } = useQuery<Weather>({
    queryKey: ["/api/weather"],
  });

  const { data: adSettings } = useQuery<AdSettings>({
    queryKey: ["/api/ad-settings"],
  });

  React.useEffect(() => {
    if (adSettings?.isEnabled) {
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adSettings.googleAdClient}`;
      script.crossOrigin = "anonymous";
      document.head.appendChild(script);
    }
  }, [adSettings]);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
             <img 
              src="https://j.top4top.io/p_33559kfwo1.jpeg" 
              alt="Logo" 
              className="h-12 w-12 object-contain" 
            />
            <h1 className="text-xl font-bold">Unity</h1>
          </div>
          <div className="flex items-center gap-4">
            {user?.isAdmin && (
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 mr-2" />
                  Admin Dashboard
                </Button>
              </Link>
            )}
            <NotificationsDropdown notifications={notifications || []} /> {/* Added NotificationsDropdown */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-8">
          {weather && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {weather.condition === "sunny" ? (
                    <Sun className="h-5 w-5 text-yellow-500" />
                  ) : (
                    <Cloud className="h-5 w-5 text-blue-500" />
                  )}
                  Weather Conditions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{weather.temperature}°C</p>
                <p className="text-muted-foreground capitalize">
                  {weather.condition}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold mb-4">Latest News</h2>
              <div className="space-y-4">
                {news?.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription>
                        {new Date(item.createdAt).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{item.content}</p>
                      {item.imageUrl && (
                        <img
                          src={item.imageUrl}
                          alt={item.title}
                          className="mt-4 rounded-md max-h-48 object-cover"
                        />
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>


          </div>
        </div>
      </main>

      {adSettings?.isEnabled && (
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-center">
            <ins
              className="adsbygoogle"
              style={{
                display: "inline-block",
                width: `${adSettings.width}px`,
                height: `${adSettings.height}px`,
              }}
              data-ad-client={adSettings.googleAdClient}
              data-ad-slot={adSettings.googleAdSlot}
            />
          </div>
        </div>
      )}
    </div>
  );
}