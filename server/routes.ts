
import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { Client } from "@replit/object-storage";

const client = new Client({
  bucket: process.env.REPLIT_DEPLOYMENT_ID || "default-bucket"
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Storage route to serve images
  app.get('/api/storage/*', async (req, res) => {
    try {
      const path = req.params[0];
      const data = await client.get(path);
      
      if (!data) {
        res.status(404).send('Image not found');
        return;
      }

      res.type(path.endsWith('.png') ? 'image/png' : 'image/jpeg');
      res.send(data);
    } catch (error) {
      console.error('Error serving image:', error);
      res.status(404).send('Image not found');
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
