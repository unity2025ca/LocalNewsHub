import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertNewsSchema, insertNotificationSchema, News } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Newspaper, PlusCircle, SendHorizonal, Trash2, CloudSun } from "lucide-react";
import { Redirect } from "wouter";

export default function AdminPage() {
  const { user } = useAuth();

  const newsForm = useForm({
    resolver: zodResolver(insertNewsSchema),
    defaultValues: {
      title: "",
      content: "",
      imageUrl: "",
    },
  });

  const notificationForm = useForm({
    resolver: zodResolver(insertNotificationSchema),
    defaultValues: {
      title: "",
      message: "",
    },
  });

  const { data: news, isLoading: newsLoading } = useQuery<News[]>({
    queryKey: ["/api/news"],
  });

  if (!user?.isAdmin) {
    return <Redirect to="/" />;
  }

  const onNewsSubmit = async (data: any) => {
    await apiRequest("POST", "/api/news", data);
    queryClient.invalidateQueries({ queryKey: ["/api/news"] });
    newsForm.reset();
  };

  const onNotificationSubmit = async (data: any) => {
    await apiRequest("POST", "/api/notifications", data);
    queryClient.invalidateQueries({ queryKey: ["/api/notifications"] });
    notificationForm.reset();
  };

  const deleteNews = async (id: number) => {
    await apiRequest("DELETE", `/api/news/${id}`);
    queryClient.invalidateQueries({ queryKey: ["/api/news"] });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Newspaper className="h-6 w-6" />
            Admin Dashboard
          </h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PlusCircle className="h-5 w-5" />
                Create News Article
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...newsForm}>
                <form onSubmit={newsForm.handleSubmit(onNewsSubmit)} className="space-y-4">
                  <FormField
                    control={newsForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="News title..." {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={newsForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Content</FormLabel>
                        <FormControl>
                          <Textarea placeholder="News content..." className="min-h-[100px]" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={newsForm.control}
                    name="imageUrl"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Image URL (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Publish News</Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <SendHorizonal className="h-5 w-5" />
                Send Notification
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...notificationForm}>
                <form onSubmit={notificationForm.handleSubmit(onNotificationSubmit)} className="space-y-4">
                  <FormField
                    control={notificationForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Notification title..." {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={notificationForm.control}
                    name="message"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Message</FormLabel>
                        <FormControl>
                          <Textarea placeholder="Notification message..." className="min-h-[100px]" {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit">Send Notification</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Newspaper className="h-5 w-5" />
              Manage News
            </CardTitle>
          </CardHeader>
          <CardContent>
            {newsLoading ? (
              <div className="flex justify-center p-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {news?.map((item) => (
                  <Card key={item.id}>
                    <CardHeader className="flex flex-row items-start justify-between">
                      <div>
                        <CardTitle>{item.title}</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(item.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <Button variant="destructive" size="icon" onClick={() => deleteNews(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
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
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}