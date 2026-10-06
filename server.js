import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

if (!process.env.OPENAI_API_KEY) {
  console.warn("OPENAI_API_KEY fehlt. Bitte .env einrichten.");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.use(express.json());
app.use(express.static("."));

app.post("/api/chat", async (req, res) => {
  try {
    const message = String(req.body?.message || "").trim();

    if (!message) {
      return res.status(400).json({ error: "Keine Nachricht." });
    }

    const response = await openai.responses.create({
      model: "gpt-5.4-mini",
      instructions:
        "Du bist JARVIS, ein persönlicher KI-Assistent. Antworte auf Deutsch, ruhig, intelligent, schnell und kurz. Sei hilfreich und direkt. Du darfst den Nutzer locker mit 'Bruder' ansprechen, aber nicht übertreiben.",
      input: message
    });

    res.json({ reply: response.output_text });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "JARVIS konnte gerade nicht antworten." });
  }
});

app.listen(port, () => {
  console.log(`JARVIS läuft auf http://localhost:${port}`);
});
