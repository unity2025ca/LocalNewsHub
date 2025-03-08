import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { News, Notification, Weather } from "@shared/schema";
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

  return (
    <div dir="rtl" className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Newspaper className="h-6 w-6" />
            <h1 className="text-xl font-bold">أخبار محلية</h1>
          </div>
          <div className="flex items-center gap-4">
            {user?.isAdmin && (
              <Link href="/admin">
                <Button variant="outline" size="sm">
                  <Settings className="h-4 w-4 ml-2" />
                  لوحة التحكم
                </Button>
              </Link>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logoutMutation.mutate()}
            >
              <LogOut className="h-4 w-4 ml-2" />
              تسجيل الخروج
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
                  حالة الطقس
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold">{weather.temperature}°C</p>
                <p className="text-muted-foreground">
                  {weather.condition === "sunny" ? "مشمس" : "غائم"}
                </p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-8 md:grid-cols-2">
            <div>
              <h2 className="text-2xl font-bold mb-4">آخر الأخبار</h2>
              <div className="space-y-4">
                {news?.map((item) => (
                  <Card key={item.id}>
                    <CardHeader>
                      <CardTitle>{item.title}</CardTitle>
                      <CardDescription>
                        {new Date(item.createdAt).toLocaleDateString("ar-SA")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>{item.content}</CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-2xl font-bold mb-4">الإشعارات</h2>
              <div className="space-y-4">
                {notifications?.map((notification) => (
                  <Card key={notification.id}>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        {notification.title}
                      </CardTitle>
                      <CardDescription>
                        {new Date(notification.createdAt).toLocaleDateString(
                          "ar-SA"
                        )}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>{notification.message}</CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
