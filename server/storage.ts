import { News, Notification, User, Weather, InsertUser, InsertNews, InsertNotification, InsertWeather } from "@shared/schema";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // News operations
  createNews(news: InsertNews & { authorId: number }): Promise<News>;
  getAllNews(): Promise<News[]>;
  getNewsById(id: number): Promise<News | undefined>;
  deleteNews(id: number): Promise<void>;

  // Notification operations
  createNotification(notification: InsertNotification): Promise<Notification>;
  getAllNotifications(): Promise<Notification[]>;

  // Weather operations
  updateWeather(weather: InsertWeather): Promise<Weather>;
  getLatestWeather(): Promise<Weather | undefined>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private news: Map<number, News>;
  private notifications: Map<number, Notification>;
  private weather: Weather | undefined;

  currentId: number;
  sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.news = new Map();
    this.notifications = new Map();
    this.currentId = 1;
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentId++;
    // Make the first registered user an admin
    const isFirstUser = this.users.size === 0;
    const user: User = { ...insertUser, id, isAdmin: isFirstUser };
    this.users.set(id, user);
    return user;
  }

  async createNews(news: InsertNews & { authorId: number }): Promise<News> {
    const id = this.currentId++;
    const newsItem: News = {
      ...news,
      id,
      createdAt: new Date(),
    };
    this.news.set(id, newsItem);
    return newsItem;
  }

  async getAllNews(): Promise<News[]> {
    return Array.from(this.news.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async getNewsById(id: number): Promise<News | undefined> {
    return this.news.get(id);
  }

  async deleteNews(id: number): Promise<void> {
    this.news.delete(id);
  }

  async createNotification(notification: InsertNotification): Promise<Notification> {
    const id = this.currentId++;
    const notificationItem: Notification = {
      ...notification,
      id,
      createdAt: new Date(),
    };
    this.notifications.set(id, notificationItem);
    return notificationItem;
  }

  async getAllNotifications(): Promise<Notification[]> {
    return Array.from(this.notifications.values()).sort((a, b) => 
      b.createdAt.getTime() - a.createdAt.getTime()
    );
  }

  async updateWeather(weather: InsertWeather): Promise<Weather> {
    const weatherUpdate: Weather = {
      ...weather,
      id: 1,
      date: new Date(),
    };
    this.weather = weatherUpdate;
    return weatherUpdate;
  }

  async getLatestWeather(): Promise<Weather | undefined> {
    return this.weather;
  }
}

export const storage = new MemStorage();