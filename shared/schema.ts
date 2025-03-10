import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
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
  expirationHours: integer("expiration_hours"),
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

export const adSettings = pgTable("ad_settings", {
  id: serial("id").primaryKey(),
  googleAdClient: text("google_ad_client").notNull(),
  googleAdSlot: text("google_ad_slot").notNull(),
  isEnabled: boolean("is_enabled").notNull().default(true),
  width: integer("width").notNull().default(728),
  height: integer("height").notNull().default(90),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

// Running the database migrations
export const initializeDatabase = async (sql: any) => {
  // Create tables if they don't exist
  // This is a simple migration approach for development
  try {
    // Create users table
    await sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL,
        is_admin BOOLEAN NOT NULL DEFAULT FALSE
      )
    `;

    // Create news table
    await sql`
      CREATE TABLE IF NOT EXISTS news (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        image_url TEXT,
        author_id INTEGER,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Add foreign key constraint after table creation
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'news_author_id_fkey'
        ) THEN
          ALTER TABLE news ADD CONSTRAINT news_author_id_fkey 
          FOREIGN KEY (author_id) REFERENCES users(id);
        END IF;
      END
      $$;
    `;

    // Create notifications table
    await sql`
      CREATE TABLE IF NOT EXISTS notifications (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        expires_at TIMESTAMP
      )
    `;

    // Add expires_at column if it doesn't exist
    await sql`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM information_schema.columns 
          WHERE table_name = 'notifications' AND column_name = 'expires_at'
        ) THEN
          ALTER TABLE notifications ADD COLUMN expires_at TIMESTAMP;
        END IF;
      END
      $$;
    `;

    // Create weather table
    await sql`
      CREATE TABLE IF NOT EXISTS weather (
        id SERIAL PRIMARY KEY,
        temperature INTEGER NOT NULL,
        condition TEXT NOT NULL,
        date TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create theme_settings table
    await sql`
      CREATE TABLE IF NOT EXISTS theme_settings (
        id SERIAL PRIMARY KEY,
        primary_color TEXT NOT NULL,
        button_color TEXT NOT NULL,
        text_color TEXT NOT NULL,
        logo_url TEXT,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    // Create ad_settings table
    await sql`
      CREATE TABLE IF NOT EXISTS ad_settings (
        id SERIAL PRIMARY KEY,
        google_ad_client TEXT NOT NULL,
        google_ad_slot TEXT NOT NULL,
        is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
        width INTEGER NOT NULL DEFAULT 728,
        height INTEGER NOT NULL DEFAULT 90,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      )
    `;

    console.log('Database tables created or already exist');
  } catch (error) {
    console.error('Error creating database tables:', error);
    throw error;
  }
};

import { z } from "zod";

export const insertUserSchema = createInsertSchema(users)
  .pick({
    username: true,
    email: true,
    password: true,
  })
  .extend({
    username: z
      .string()
      .min(6, "Username must be at least 6 characters")
      .regex(/^[a-zA-Z0-9_]+$/, "Username must contain only English letters, numbers, and underscores"),
    email: z
      .string()
      .email("Please enter a valid email address"),
    password: z
      .string()
      .min(6, "Password must be at least 6 characters")
      .regex(/^[a-zA-Z0-9!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]+$/, "Password must contain only English letters, numbers, and symbols"),
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
  expirationHours: true,
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

export const adSettingsSchema = createInsertSchema(adSettings).pick({
  googleAdClient: true,
  googleAdSlot: true,
  isEnabled: true,
  width: true,
  height: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type News = typeof news.$inferSelect;
export type Notification = typeof notifications.$inferSelect;
export type Weather = typeof weather.$inferSelect;
export type ThemeSettings = typeof themeSettings.$inferSelect;
export type AdSettings = typeof adSettings.$inferSelect;