/**
 * API Routes Configuration
 * Defines REST endpoints for the PartSelect AI Chat Agent
 */
import type { Express } from "express";
import { createServer, type Server } from "http";
import { chatRequestSchema, ChatRequest } from "@shared/schema";
import { chatService } from "./services/chatService";
import { imageProxyService } from "./services/imageProxy";
import { PartDataService } from "./services/partDataService";

export async function registerRoutes(app: Express): Promise<Server> {
  
  // POST /api/chat - Primary chat endpoint for user interactions
  app.post("/api/chat", async (req, res) => {
    try {
      // Validate request body
      const validationResult = chatRequestSchema.safeParse(req.body);
      
      if (!validationResult.success) {
        return res.status(400).json({
          message: "Invalid request format",
          errors: validationResult.error.errors
        });
      }

      const chatRequest: ChatRequest = validationResult.data;
      
      // Process the chat message
      const response = await chatService.processMessage(chatRequest);
      
      res.json(response);
      
    } catch (error) {
      console.error("Chat API error:", error);
      res.status(500).json({
        message: "Internal server error processing chat message"
      });
    }
  });

  // GET /api/proxy-image - Proxy external images to avoid CORS issues
  app.get("/api/proxy-image", async (req, res) => {
    try {
      const imageUrl = req.query.url as string;
      if (!imageUrl) {
        return res.status(400).json({ error: "Missing image URL parameter" });
      }

      await imageProxyService.proxyImage(imageUrl, res);
    } catch (error) {
      console.error("Image proxy error:", error);
      res.status(500).json({ error: "Failed to proxy image" });
    }
  });

  // GET /api/part/:partNumber - Get part data from consolidated service
  app.get("/api/part/:partNumber", async (req, res) => {
    try {
      const partNumber = req.params.partNumber;
      const data = PartDataService.getPartData(partNumber);
      
      if (data) {
        res.json(data);
      } else {
        // Return fallback data for unknown parts
        const fallbackData = PartDataService.createFallbackData(partNumber);
        res.json(fallbackData);
      }
    } catch (error) {
      console.error("Part data error:", error);
      res.status(500).json({ error: "Failed to retrieve part data" });
    }
  });

  // GET /api/search/:query - Search parts by query
  app.get("/api/search/:query", async (req, res) => {
    try {
      const query = req.params.query;
      console.log(`🔍 Searching for: ${query}`);
      
      const results = PartDataService.searchParts(query);
      
      res.json({ 
        results,
        count: results.length,
        query 
      });
    } catch (error) {
      console.error("Search error:", error);
      res.status(500).json({ 
        error: "Failed to search parts",
        results: [],
        query: req.params.query
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
