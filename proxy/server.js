import crypto from "crypto";
import "dotenv/config";
import cors from "cors";
import express from "express";

const app = express();
const PORT = Number(process.env.PORT) || 3001;
const ACCESS_PASSWORD = process.env.ACCESS_PASSWORD || "LabsterAI123";
const SESSION_MS = Number(process.env.SESSION_MS) || 24 * 60 * 60 * 1000;
const sessions = new Map();

app.use(express.json({ limit: "1mb" }));
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN || "*",
    methods: ["POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Access-Token"],
  })
);

function pruneSessions() {
  const now = Date.now();
  for (const [token, expires] of sessions) {
    if (expires <= now) sessions.delete(token);
  }
}

function requireAuth(req, res, next) {
  pruneSessions();
  const token =
    req.headers.authorization?.replace(/^Bearer\s+/i, "") ||
    req.headers["x-access-token"];
  if (token && sessions.has(token) && sessions.get(token) > Date.now()) {
    return next();
  }
  return res.status(401).json({ error: "Unauthorized" });
}

app.post("/api/auth", (req, res) => {
  const { password } = req.body || {};
  if (password !== ACCESS_PASSWORD) {
    return res.status(401).json({ error: "Invalid password" });
  }
  const token = crypto.randomBytes(24).toString("hex");
  sessions.set(token, Date.now() + SESSION_MS);
  res.json({ ok: true, token });
});

app.get("/health", (_req, res) => {
  res.json({ ok: true });
});

app.post("/api/claude", requireAuth, async (req, res) => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: "ANTHROPIC_API_KEY not configured" });
  }

  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: "messages array required" });
  }

  try {
    const upstream = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: Number(process.env.MAX_TOKENS) || 4096,
        messages,
      }),
    });

    const data = await upstream.json();

    if (!upstream.ok) {
      return res
        .status(upstream.status)
        .json({ error: data.error?.message || "Anthropic API error" });
    }

    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("");

    res.json({ text });
  } catch (err) {
    res.status(502).json({ error: err.message || "Upstream request failed" });
  }
});

app.listen(PORT, () => {
  console.log(`Claude proxy listening on http://localhost:${PORT}`);
});
