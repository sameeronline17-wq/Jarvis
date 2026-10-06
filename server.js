import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

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

// JARVIS antwortet mit OpenAI
const response = await openai.responses.create({
model: "gpt-5.4-mini",
instructions:
"Du bist JARVIS, ein persönlicher KI-Assistent. Antworte auf Deutsch, ruhig, intelligent, schnell und kurz. Sei hilfreich und direkt. Du darfst den Nutzer locker mit 'Bruder' oder 'Chef' ansprechen, aber nicht übertreiben.",
input: message
});

const reply = response.output_text;

// ElevenLabs erzeugt die Stimme
const voiceId = "JBFqnCBsd6RMkjVDRZzb";

const ttsResponse = await fetch(
`https://api.elevenlabs.io/v1/text-to-speech/${voiceId}?output_format=mp3_44100_128`,
{
method: "POST",
headers: {
"xi-api-key": process.env.ELEVENLABS_API_KEY,
"Content-Type": "application/json"
},
body: JSON.stringify({
text: reply,
model_id: "eleven_multilingual_v2"
})
}
);

if (!ttsResponse.ok) {
const errorText = await ttsResponse.text();
console.error("ElevenLabs Fehler:", errorText);

return res.json({
reply,
audio: null
});
}

const audioBuffer = Buffer.from(
await ttsResponse.arrayBuffer()
);

const audioBase64 = audioBuffer.toString("base64");

res.json({
reply,
audio: audioBase64
});

} catch (error) {
console.error(error);
res.status(500).json({
error: "JARVIS konnte gerade nicht antworten."
});
}
});

app.listen(port, () => {
console.log(`JARVIS läuft auf Port ${port}`);
});
