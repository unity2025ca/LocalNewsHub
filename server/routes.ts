import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertNewsSchema, insertNotificationSchema, insertWeatherSchema, updatePasswordSchema, themeSettingsSchema, adSettingsSchema } from "@shared/schema";
import { z } from "zod";
import { hashPassword } from './auth'; // Assuming hashPassword function exists in ./auth

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // User Routes
  app.get("/api/users", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).send("Only admins can view all users");
    }

    const users = await storage.getAllUsers();
    res.json(users);
  });

  app.delete("/api/users/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).send("Only admins can delete users");
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).send("Invalid user ID");
    }

    // Prevent admin from deleting themselves
    if (id === req.user.id) {
      return res.status(400).send("Cannot delete your own account");
    }

    const user = await storage.getUser(id);
    if (!user) {
      return res.status(404).send("User not found");
    }

    await storage.deleteUser(id);
    res.sendStatus(200);
  });

  app.patch("/api/users/:id/password", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).send("Only admins can update user passwords");
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).send("Invalid user ID");
    }

    try {
      const validatedData = updatePasswordSchema.parse(req.body);
      const hashedPassword = await hashPassword(validatedData.password);
      await storage.updateUserPassword(id, hashedPassword);
      res.sendStatus(200);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        throw e;
      }
    }
  });

  // Theme Routes
  app.get("/api/theme", async (_req, res) => {
    const theme = await storage.getThemeSettings();
    if (!theme) {
      return res.status(404).send("No theme settings found");
    }
    res.json(theme);
  });

  app.post("/api/theme", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).send("Only admins can update theme settings");
    }

    try {
      const validatedData = themeSettingsSchema.parse(req.body);
      const theme = await storage.updateThemeSettings(validatedData);
      res.status(200).json(theme);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        throw e;
      }
    }
  });

  // News Routes
  app.get("/api/news", async (_req, res) => {
    const news = await storage.getAllNews();
    res.json(news);
  });

  app.post("/api/news", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).send("Only admins can create news");
    }

    try {
      const validatedData = insertNewsSchema.parse(req.body);
      const news = await storage.createNews({
        ...validatedData,
        authorId: req.user.id,
      });
      res.status(201).json(news);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        throw e;
      }
    }
  });

  app.delete("/api/news/:id", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).send("Only admins can delete news");
    }

    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).send("Invalid news ID");
    }

    const news = await storage.getNewsById(id);
    if (!news) {
      return res.status(404).send("News not found");
    }

    await storage.deleteNews(id);
    res.sendStatus(200);
  });

  // Notifications Routes
  app.get("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated()) {
      return res.status(401).send("Must be logged in to view notifications");
    }

    const notifications = await storage.getActiveNotifications();
    res.json(notifications);
  });

  app.post("/api/notifications", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).send("Only admins can create notifications");
    }

    try {
      const validatedData = insertNotificationSchema.parse(req.body);
      const notification = await storage.createNotification(validatedData);
      res.status(201).json(notification);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        throw e;
      }
    }
  });

  // Weather Routes
  app.get("/api/weather", async (_req, res) => {
    const weather = await storage.getLatestWeather();
    if (!weather) {
      return res.status(404).send("No weather data available");
    }
    res.json(weather);
  });

  app.post("/api/weather", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).send("Only admins can update weather");
    }

    try {
      const validatedData = insertWeatherSchema.parse(req.body);
      const weather = await storage.updateWeather(validatedData);
      res.status(201).json(weather);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        throw e;
      }
    }
  });

  // Ad Settings Routes
  app.get("/api/ad-settings", async (_req, res) => {
    const settings = await storage.getAdSettings();
    if (!settings) {
      return res.status(404).send("No ad settings found");
    }
    res.json(settings);
  });

  app.post("/api/ad-settings", async (req, res) => {
    if (!req.isAuthenticated() || !req.user.isAdmin) {
      return res.status(403).send("Only admins can update ad settings");
    }

    try {
      const validatedData = adSettingsSchema.parse(req.body);
      const settings = await storage.updateAdSettings(validatedData);
      res.status(200).json(settings);
    } catch (e) {
      if (e instanceof z.ZodError) {
        res.status(400).json(e.errors);
      } else {
        throw e;
      }
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}