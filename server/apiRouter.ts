import express, { Request, Response } from "express";
import { analyzeFridgeImage, askChefAssistant } from "./geminiService.ts";

export const apiRouter = express.Router();

// Parse JSON bodies with up to 50mb limit for high-res fridge camera photos
apiRouter.use(express.json({ limit: "50mb" }));
apiRouter.use(express.urlencoded({ extended: true, limit: "50mb" }));

apiRouter.get("/health", (req: Request, res: Response) => {
  res.json({
    status: "ok",
    hasGeminiKey: !!process.env.GEMINI_API_KEY,
    timestamp: new Date().toISOString(),
  });
});

apiRouter.post("/analyze-fridge", async (req: Request, res: Response) => {
  try {
    const { imageBase64, mimeType, preferences } = req.body;

    if (!imageBase64) {
      return res.status(400).json({ error: "Missing imageBase64 parameter" });
    }

    const result = await analyzeFridgeImage(
      imageBase64,
      mimeType || "image/jpeg",
      preferences
    );

    res.json(result);
  } catch (err: any) {
    console.error("API /analyze-fridge error:", err);
    res.status(500).json({
      error: err.message || "Failed to analyze fridge image",
      details: String(err),
    });
  }
});

apiRouter.post("/chat-chef", async (req: Request, res: Response) => {
  try {
    const { question, context } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Missing question parameter" });
    }

    const answer = await askChefAssistant(question, context);
    res.json({ answer });
  } catch (err: any) {
    console.error("API /chat-chef error:", err);
    res.status(500).json({
      error: err.message || "Failed to process question",
    });
  }
});
