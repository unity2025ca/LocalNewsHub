import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").notNull().default(false),
});

export const news = pgTable("news", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  content: text("content").notNull(),
  imageUrl: text("image_url"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  authorId: integer("author_id").references(() => users.id),
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const weather = pgTable("weather", {
  id: serial("id").primaryKey(),
  temperature: integer("temperature").notNull(),
  condition: text("condition").notNull(),
  date: timestamp("date").notNull().defaultNow(),
});

export const themeSettings = pgTable("theme_settings", {
  id: serial("id").primaryKey(),
  primaryColor: text("primary_color").notNull(),
  buttonColor: text("button_color").notNull(),
  textColor: text("text_color").notNull(),
  logoUrl: text("logo_url"),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const updatePasswordSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

export const insertNewsSchema = createInsertSchema(news).pick({
  title: true,
  content: true,
  imageUrl: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).pick({
  title: true,
  message: true,
});

export const insertWeatherSchema = createInsertSchema(weather).pick({
  temperature: true,
  condition: true,
});

export const themeSettingsSchema = createInsertSchema(themeSettings).pick({
  primaryColor: true,
  buttonColor: true,
  textColor: true,
  logoUrl: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type News = typeof news.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Weather = typeof weather.$inferSelect;
export type ThemeSettings = typeof themeSettings.$inferSelect;