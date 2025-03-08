import { useAuth } from "@/hooks/use-auth";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertNewsSchema, insertWeatherSchema, News } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { useQuery } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Loader2, Trash2 } from "lucide-react";
import { Redirect } from "wouter";

export default function AdminPage() {
  const { user } = useAuth();

  const newsForm = useForm({
    resolver: zodResolver(insertNewsSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const weatherForm = useForm({
    resolver: zodResolver(insertWeatherSchema),
    defaultValues: {
      temperature: 0,
      condition: "",
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

  const onWeatherSubmit = async (data: any) => {
    await apiRequest("POST", "/api/weather", data);
    queryClient.invalidateQueries({ queryKey: ["/api/weather"] });
    weatherForm.reset();
  };

  const deleteNews = async (id: number) => {
    await apiRequest("DELETE", `/api/news/${id}`);
    queryClient.invalidateQueries({ queryKey: ["/api/news"] });
  };

  return (
    <div dir="rtl" className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">لوحة التحكم</h1>

        <div className="grid md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>إضافة خبر جديد</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...newsForm}>
                <form onSubmit={newsForm.handleSubmit(onNewsSubmit)} className="space-y-4">
                  <FormField
                    control={newsForm.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>عنوان الخبر</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={newsForm.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>محتوى الخبر</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit">نشر الخبر</Button>
                </form>
              </Form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>تحديث حالة الطقس</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...weatherForm}>
                <form onSubmit={weatherForm.handleSubmit(onWeatherSubmit)} className="space-y-4">
                  <FormField
                    control={weatherForm.control}
                    name="temperature"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>درجة الحرارة</FormLabel>
                        <FormControl>
                          <Input type="number" {...field} onChange={e => field.onChange(parseInt(e.target.value))} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={weatherForm.control}
                    name="condition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>الحالة</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <Button type="submit">تحديث الطقس</Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>إدارة الأخبار</CardTitle>
          </CardHeader>
          <CardContent>
            {newsLoading ? (
              <div className="flex justify-center">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              <div className="space-y-4">
                {news?.map((item) => (
                  <Card key={item.id}>
                    <CardHeader className="flex flex-row items-center justify-between">
                      <CardTitle>{item.title}</CardTitle>
                      <Button variant="destructive" size="icon" onClick={() => deleteNews(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </CardHeader>
                    <CardContent>
                      <p>{item.content}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
