/**
 * Minimal Express backend used for LLM narrative generation.
 *
 * The frontend can render a report without any server. When a Gemini API key is
 * configured, it can call this server endpoint to stream back an AI narrative.
 */
import "dotenv/config";
import express from "express";
import cors from "cors";
import { GoogleGenAI } from "@google/genai";
import { NarrativeRequestSchema } from "./narrativeSchema";

const app = express();
const PORT = Number(process.env.PORT) || 3001;

// Permissive CORS: acceptable for local development. In production, restrict
// to the frontend origin (e.g. cors({ origin: "https://app.example.com" })).
app.use(cors());
app.use(express.json({ limit: "1mb" }));

const SYSTEM_INSTRUCTION =
  "You generate engineering reports. You are a senior process analytics engineer. Write a concise, professional report narrative.";

const USER_PROMPT_PREFIX = [
  "Use the provided JSON and produce:",
  "1) Executive summary (3-5 bullets)",
  "2) Top drivers of KPI improvement and why (bullets)",
  "3) Recommended next experiments (3-5 bullets)",
  "Keep it factual and grounded in the numbers.",
  "",
  "JSON:",
].join("\n");

app.post("/api/generate-narrative", async (req, res) => {
  // We keep the API key server-side so it isn't exposed in the browser bundle.
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey?.trim()) {
    res.status(500).json({
      error: "GEMINI_API_KEY is not configured. Set it in .env and restart the server.",
    });
    return;
  }

  // Validate the request body so the prompt is well-structured and predictable.
  const parsed = NarrativeRequestSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({
      error: "Invalid request body.",
      details: parsed.error.flatten(),
    });
    return;
  }

  try {
    const ai = new GoogleGenAI({ apiKey: apiKey.trim() });
    const userContent = `${USER_PROMPT_PREFIX}\n${JSON.stringify(parsed.data)}`;
    const stream = await ai.models.generateContentStream({
      model: "gemini-2.5-flash",
      contents: userContent,
      config: {
        temperature: 0.2,
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    // Server-Sent Events (SSE): keep the HTTP connection open and write "data:" lines.
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");
    if (typeof res.flushHeaders === "function") res.flushHeaders();

    try {
      for await (const chunk of stream) {
        const text = chunk.text ?? "";
        if (text) {
          // Each event is a JSON payload; the client appends `text` as it arrives.
          res.write(`data: ${JSON.stringify({ text })}\n\n`);
        }
      }
      // A sentinel event so the client knows the stream ended cleanly.
      res.write("data: [DONE]\n\n");
    } catch (streamErr) {
      const errMessage =
        streamErr instanceof Error ? streamErr.message : String(streamErr);
      console.error("Stream error:", errMessage);
      res.write(`data: ${JSON.stringify({ error: "Stream failed." })}\n\n`);
    }
    res.end();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    const stack = e instanceof Error ? e.stack : undefined;
    console.error("Narrative generation failed:", message, stack ?? "");
    res.status(500).json({ error: "Narrative generation failed." });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on http://localhost:${PORT}`);
});
