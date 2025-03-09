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
import React from 'react';

export default function HomePage() {
  const { user, logoutMutation } = useAuth();

  const { data: news } = useQuery<News[]>({
    queryKey: ["/api/news"],
  });

  const { data: notifications } = useQuery<Notification[]>({
    queryKey: ["/api/notifications"],
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
            <Newspaper className="h-6 w-6" />
            <h1 className="text-xl font-bold">Local News</h1>
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

            <div>
              <h2 className="text-2xl font-bold mb-4">Notifications</h2>
              <div className="space-y-4">
                {notifications?.map((notification) => (
                  <Card key={notification.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        {notification.title}
                      </CardTitle>
                      <CardDescription>
                        {new Date(notification.createdAt).toLocaleString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="whitespace-pre-wrap">{notification.message}</p>
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
import { useState, useCallback } from 'react';
import { useAutoRefresh } from '@/hooks/use-auto-refresh';
import { News, Notification, Weather } from '@shared/schema';

export default function HomePage() {
  const [news, setNews] = useState<News[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [weather, setWeather] = useState<Weather | null>(null);

  // Function to fetch all data
  const fetchData = useCallback(async () => {
    try {
      // Fetch news
      const newsResponse = await fetch('/api/news');
      if (newsResponse.ok) {
        const newsData = await newsResponse.json();
        setNews(newsData);
      }

      // Fetch notifications
      const notificationsResponse = await fetch('/api/notifications');
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        setNotifications(notificationsData);
      }

      // Fetch weather
      const weatherResponse = await fetch('/api/weather');
      if (weatherResponse.ok) {
        const weatherData = await weatherResponse.json();
        setWeather(weatherData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }, []);

  // Use the auto-refresh hook to refresh data every 5 seconds
  useAutoRefresh(fetchData, 5000);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Local News Dashboard</h1>
      
      {/* Weather section */}
      {weather && (
        <div className="mb-6 p-4 bg-card rounded-lg shadow">
          <h2 className="text-xl font-semibold">Weather Today</h2>
          <p>Temperature: {weather.temperature}°C</p>
          <p>Condition: {weather.condition}</p>
        </div>
      )}
      
      {/* News section */}
      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Latest News</h2>
        {news.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {news.map((item) => (
              <div key={item.id} className="bg-card p-4 rounded-lg shadow">
                {item.imageUrl && (
                  <img 
                    src={item.imageUrl} 
                    alt={item.title} 
                    className="w-full h-40 object-cover rounded mb-3" 
                  />
                )}
                <h3 className="font-bold">{item.title}</h3>
                <p className="mt-2">{item.content}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(item.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>No news available</p>
        )}
      </div>
      
      {/* Notifications section */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Notifications</h2>
        {notifications.length > 0 ? (
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div key={notification.id} className="bg-card p-4 rounded-lg shadow">
                <h3 className="font-bold">{notification.title}</h3>
                <p className="mt-2">{notification.message}</p>
                <p className="text-xs text-muted-foreground mt-2">
                  {new Date(notification.createdAt).toLocaleString()}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <p>No notifications available</p>
        )}
      </div>
    </div>
  );
}
