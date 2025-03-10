import { News, Notification, User, Weather, InsertUser, ThemeSettings, InsertNews, InsertNotification, InsertWeather, AdSettings } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, or, isNull, gt } from "drizzle-orm";
import * as schema from "../shared/schema";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<void>;
  updateUserPassword(id: number, password: string): Promise<void>;

  // News operations
  createNews(news: InsertNews & { authorId: number }): Promise<News>;
  getAllNews(): Promise<News[]>;
  getNewsById(id: number): Promise<News | undefined>;
  deleteNews(id: number): Promise<void>;

  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getAllNotifications(): Promise<Notification[]>;
  getActiveNotifications(): Promise<Notification[]>;

  // Weather operations
  updateWeather(weather: InsertWeather): Promise<Weather>;
  getLatestWeather(): Promise<Weather | undefined>;

  // Theme operations
  updateThemeSettings(settings: Omit<ThemeSettings, "id" | "updatedAt">): Promise<ThemeSettings>;
  getThemeSettings(): Promise<ThemeSettings | undefined>;

  // Ad Settings operations
  updateAdSettings(settings: Omit<AdSettings, "id" | "updatedAt">): Promise<AdSettings>;
  getAdSettings(): Promise<AdSettings | undefined>;

  sessionStore: session.Store;
}

export class PostgresStorage implements IStorage {
  private db;
  sessionStore: session.Store;

  constructor() {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }

    const sql = neon(process.env.DATABASE_URL);
    this.db = drizzle(sql, { schema });

    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    const users = await this.db.query.users.findMany({
      where: eq(schema.users.id, id)
    });
    return users[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const users = await this.db.query.users.findMany({
      where: eq(schema.users.username, username)
    });
    return users[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    // Check if this is the first user to make them admin
    const allUsers = await this.db.query.users.findMany();
    const isFirstUser = allUsers.length === 0;

    const [user] = await this.db.insert(schema.users)
      .values({
        ...insertUser,
        isAdmin: isFirstUser
      })
      .returning();

    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return await this.db.query.users.findMany();
  }

  async deleteUser(id: number): Promise<void> {
    await this.db.delete(schema.users)
      .where(eq(schema.users.id, id));
  }

  async updateUserPassword(id: number, password: string): Promise<void> {
    await this.db.update(schema.users)
      .set({ password })
      .where(eq(schema.users.id, id));
  }

  async createNews(news: InsertNews & { authorId: number }): Promise<News> {
    const [newsItem] = await this.db.insert(schema.news)
      .values({
        ...news,
        createdAt: new Date()
      })
      .returning();

    return newsItem;
  }

  async getAllNews(): Promise<News[]> {
    const allNews = await this.db.query.news.findMany();
    return allNews.sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getNewsById(id: number): Promise<News | undefined> {
    const newsItems = await this.db.query.news.findMany({
      where: eq(schema.news.id, id)
    });
    return newsItems[0];
  }

  async deleteNews(id: number): Promise<void> {
    await this.db.delete(schema.news)
      .where(eq(schema.news.id, id));
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const [notificationItem] = await this.db.insert(schema.notifications)
      .values({
        ...notification,
        createdAt: new Date()
      })
      .returning();

    return notificationItem;
  }

  async getAllNotifications(): Promise<Notification[]> {
    return this.db.query.notifications.findMany({
      orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
    });
  }

  async getActiveNotifications(): Promise<Notification[]> {
    const now = new Date();
    return this.db.query.notifications.findMany({
      where: or(
        isNull(schema.notifications.expirationHours),
        gt(
          sql`${schema.notifications.createdAt} + (${schema.notifications.expirationHours} * INTERVAL '1 hour')`,
          now
        )
      ),
      orderBy: (notifications, { desc }) => [desc(notifications.createdAt)],
    });
  }

  async updateWeather(weather: InsertWeather): Promise<Weather> {
    // First check if a weather record exists
    const existingWeather = await this.db.query.weather.findMany();

    if (existingWeather.length > 0) {
      // Update existing record
      const [weatherUpdate] = await this.db.update(schema.weather)
        .set({
          ...weather,
          date: new Date()
        })
        .where(eq(schema.weather.id, existingWeather[0].id))
        .returning();

      return weatherUpdate;
    } else {
      // Create new record
      const [weatherUpdate] = await this.db.insert(schema.weather)
        .values({
          ...weather,
          date: new Date()
        })
        .returning();

      return weatherUpdate;
    }
  }

  async getLatestWeather(): Promise<Weather | undefined> {
    const weatherData = await this.db.query.weather.findMany({
      orderBy: (weather, { desc }) => [desc(weather.date)]
    });
    return weatherData[0];
  }

  async updateThemeSettings(settings: Omit<ThemeSettings, "id" | "updatedAt">): Promise<ThemeSettings> {
    // Check if theme settings exist
    const existingSettings = await this.db.query.themeSettings.findMany();

    if (existingSettings.length > 0) {
      // Update existing record
      const [themeUpdate] = await this.db.update(schema.themeSettings)
        .set({
          ...settings,
          updatedAt: new Date()
        })
        .where(eq(schema.themeSettings.id, existingSettings[0].id))
        .returning();

      return themeUpdate;
    } else {
      // Create new record
      const [themeUpdate] = await this.db.insert(schema.themeSettings)
        .values({
          ...settings,
          updatedAt: new Date()
        })
        .returning();

      return themeUpdate;
    }
  }

  async getThemeSettings(): Promise<ThemeSettings | undefined> {
    const settings = await this.db.query.themeSettings.findMany();
    return settings[0];
  }

  async updateAdSettings(settings: Omit<AdSettings, "id" | "updatedAt">): Promise<AdSettings> {
    // Check if ad settings exist
    const existingSettings = await this.db.query.adSettings.findMany();

    if (existingSettings.length > 0) {
      // Update existing record
      const [adUpdate] = await this.db.update(schema.adSettings)
        .set({
          ...settings,
          updatedAt: new Date()
        })
        .where(eq(schema.adSettings.id, existingSettings[0].id))
        .returning();

      return adUpdate;
    } else {
      // Create new record
      const [adUpdate] = await this.db.insert(schema.adSettings)
        .values({
          ...settings,
          updatedAt: new Date()
        })
        .returning();

      return adUpdate;
    }
  }

  async getAdSettings(): Promise<AdSettings | undefined> {
    const settings = await this.db.query.adSettings.findMany();
    return settings[0];
  }
}

// Change this line to use PostgreSQL storage
export const storage = new PostgresStorage();