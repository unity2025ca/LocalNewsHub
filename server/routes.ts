import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertNewsSchema, insertNotificationSchema, insertWeatherSchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

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
    
    const notifications = await storage.getAllNotifications();
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

  const httpServer = createServer(app);
  return httpServer;
}
