import { Express, Request, Response } from "express";
import { Server } from "http";

export async function registerRoutes(app: Express): Promise<Server> {
  app.get("/health", (_req: Request, res: Response) => {
    res.json({ status: "ok" });
  });

  return app.listen(5000, "0.0.0.0", () => {
    console.log("Server running on port 5000");
  });
}