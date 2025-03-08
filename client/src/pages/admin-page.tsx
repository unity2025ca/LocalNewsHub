import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertNewsSchema, insertNotificationSchema, News, User, updatePasswordSchema, themeSettingsSchema, adSettingsSchema } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import {
  Home,
  Loader2,
  LogOut,
  Newspaper,
  PlusCircle,
  SendHorizonal,
  Trash2,
  Users,
  Key,
  Palette,
  MonitorSmartphone
} from "lucide-react";
import { Link, Redirect } from "wouter";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function AdminPage() {
  const { user, logoutMutation } = useAuth();

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

  const passwordForm = useForm({
    resolver: zodResolver(updatePasswordSchema),
    defaultValues: {
      password: "",
    },
  });

  const themeForm = useForm({
    resolver: zodResolver(themeSettingsSchema),
    defaultValues: {
      primaryColor: "",
      buttonColor: "",
      textColor: "",
      logoUrl: "",
    },
  });

  const adSettingsForm = useForm({
    resolver: zodResolver(adSettingsSchema),
    defaultValues: {
      googleAdClient: "",
      googleAdSlot: "",
      isEnabled: true,
      width: 728,
      height: 90,
    },
  });

  const { data: news, isLoading: newsLoading } = useQuery<News[]>({
    queryKey: ["/api/news"],
  });

  const { data: users, isLoading: usersLoading } = useQuery<User[]>({
    queryKey: ["/api/users"],
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

  const onPasswordSubmit = async (userId: number, data: any) => {
    await apiRequest("PATCH", `/api/users/${userId}/password`, data);
    passwordForm.reset();
  };

  const onThemeSubmit = async (data: any) => {
    await apiRequest("POST", "/api/theme", data);
    queryClient.invalidateQueries({ queryKey: ["/api/theme"] });
    themeForm.reset();
  };

  const onAdSettingsSubmit = async (data: any) => {
    await apiRequest("POST", "/api/ad-settings", data);
    queryClient.invalidateQueries({ queryKey: ["/api/ad-settings"] });
    adSettingsForm.reset();
  };

  const deleteNews = async (id: number) => {
    await apiRequest("DELETE", `/api/news/${id}`);
    queryClient.invalidateQueries({ queryKey: ["/api/news"] });
  };

  const deleteUser = async (id: number) => {
    await apiRequest("DELETE", `/api/users/${id}`);
    queryClient.invalidateQueries({ queryKey: ["/api/users"] });
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Newspaper className="h-6 w-6" />
              Admin Dashboard
            </h1>
            <div className="flex items-center gap-4">
              <Link href="/">
                <Button variant="outline" size="sm">
                  <Home className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs defaultValue="news">
          <TabsList className="mb-8">
            <TabsTrigger value="news">News Management</TabsTrigger>
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="theme">Theme Settings</TabsTrigger>
            <TabsTrigger value="ads">Advertisement</TabsTrigger>
          </TabsList>

          <TabsContent value="news">
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
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Registered Users
                </CardTitle>
              </CardHeader>
              <CardContent>
                {usersLoading ? (
                  <div className="flex justify-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {users?.map((userItem) => (
                      <Card key={userItem.id}>
                        <CardHeader className="flex flex-row items-start justify-between">
                          <div>
                            <CardTitle>{userItem.username}</CardTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                              {userItem.isAdmin ? "Administrator" : "Regular User"}
                            </p>
                          </div>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="outline" size="icon">
                                  <Key className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Update Password</DialogTitle>
                                </DialogHeader>
                                <Form {...passwordForm}>
                                  <form
                                    onSubmit={passwordForm.handleSubmit((data) =>
                                      onPasswordSubmit(userItem.id, data)
                                    )}
                                    className="space-y-4"
                                  >
                                    <FormField
                                      control={passwordForm.control}
                                      name="password"
                                      render={({ field }) => (
                                        <FormItem>
                                          <FormLabel>New Password</FormLabel>
                                          <FormControl>
                                            <Input
                                              type="password"
                                              placeholder="Enter new password"
                                              {...field}
                                            />
                                          </FormControl>
                                        </FormItem>
                                      )}
                                    />
                                    <Button type="submit">Update Password</Button>
                                  </form>
                                </Form>
                              </DialogContent>
                            </Dialog>
                            <Button
                              variant="destructive"
                              size="icon"
                              onClick={() => deleteUser(userItem.id)}
                              disabled={userItem.id === user.id}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="theme">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Customize Login Page
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...themeForm}>
                  <form onSubmit={themeForm.handleSubmit(onThemeSubmit)} className="space-y-4">
                    <FormField
                      control={themeForm.control}
                      name="primaryColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Primary Color</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input type="color" className="w-12 h-10 p-1" {...field} />
                              <Input
                                placeholder="e.g. #FF0000 or rgb(255, 0, 0)"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                  const colorInput = document.querySelector(`input[type="color"][name="${field.name}"]`) as HTMLInputElement;
                                  if (colorInput) colorInput.value = e.target.value;
                                }}
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={themeForm.control}
                      name="buttonColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Button Color</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input type="color" className="w-12 h-10 p-1" {...field} />
                              <Input
                                placeholder="e.g. #FF0000 or rgb(255, 0, 0)"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                  const colorInput = document.querySelector(`input[type="color"][name="${field.name}"]`) as HTMLInputElement;
                                  if (colorInput) colorInput.value = e.target.value;
                                }}
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={themeForm.control}
                      name="textColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Text Color</FormLabel>
                          <FormControl>
                            <div className="flex gap-2">
                              <Input type="color" className="w-12 h-10 p-1" {...field} />
                              <Input
                                placeholder="e.g. #FF0000 or rgb(255, 0, 0)"
                                {...field}
                                onChange={(e) => {
                                  field.onChange(e.target.value);
                                  const colorInput = document.querySelector(`input[type="color"][name="${field.name}"]`) as HTMLInputElement;
                                  if (colorInput) colorInput.value = e.target.value;
                                }}
                              />
                            </div>
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={themeForm.control}
                      name="logoUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Logo URL</FormLabel>
                          <FormControl>
                            <Input placeholder="https://..." {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <Button type="submit">Save Theme Settings</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="ads">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MonitorSmartphone className="h-5 w-5" />
                  Google Ads Settings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...adSettingsForm}>
                  <form onSubmit={adSettingsForm.handleSubmit(onAdSettingsSubmit)} className="space-y-4">
                    <FormField
                      control={adSettingsForm.control}
                      name="googleAdClient"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Google Ad Client ID</FormLabel>
                          <FormControl>
                            <Input placeholder="ca-pub-xxxxxxxxxxxxxxxx" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={adSettingsForm.control}
                      name="googleAdSlot"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Google Ad Slot ID</FormLabel>
                          <FormControl>
                            <Input placeholder="xxxxxxxxxx" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={adSettingsForm.control}
                      name="isEnabled"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Enable Advertisements</FormLabel>
                          <FormControl>
                            <Input type="checkbox" {...field} />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={adSettingsForm.control}
                        name="width"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ad Width (px)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={adSettingsForm.control}
                        name="height"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Ad Height (px)</FormLabel>
                            <FormControl>
                              <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <Button type="submit">Save Ad Settings</Button>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}