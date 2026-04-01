const express = require("express");
const multer = require("multer");
const bodyParser = require("body-parser");
const crypto = require("crypto");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const ROOT_DIR = __dirname;
const DB_PATH = path.join(ROOT_DIR, "database.json");
const UPLOAD_DIR = path.join(ROOT_DIR, "uploads");
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ChangeMe123!";
const sessions = new Map();
const sseClients = new Set();

function ensureDirectories() {
  if (!fs.existsSync(UPLOAD_DIR)) {
    fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  }
}

function readDatabase() {
  return JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
}

function writeDatabase(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function safeEqual(a, b) {
  const aBuffer = Buffer.from(String(a));
  const bBuffer = Buffer.from(String(b));
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function generateToken() {
  return crypto.randomBytes(32).toString("hex");
}

function pruneSessions() {
  const now = Date.now();
  for (const [token, session] of sessions.entries()) {
    if (session.expiresAt <= now) {
      sessions.delete(token);
    }
  }
}

function broadcastUpdate(updatedAt) {
  const payload = `data: ${JSON.stringify({ updatedAt })}\n\n`;
  for (const client of sseClients) {
    client.write(payload);
  }
}

function requireAuth(req, res, next) {
  pruneSessions();
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const session = sessions.get(token);

  if (!session || session.expiresAt <= Date.now()) {
    if (token) sessions.delete(token);
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.session = session;
  next();
}

ensureDirectories();

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname) || ".jpg";
    const uniqueName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${extension}`;
    cb(null, uniqueName);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024
  }
});

app.use(bodyParser.json({ limit: "10mb" }));
app.use(bodyParser.urlencoded({ extended: true }));
app.use("/uploads", express.static(UPLOAD_DIR));
app.use(express.static(ROOT_DIR));

app.get("/api/content", (_req, res) => {
  res.json(readDatabase());
});

app.get("/api/content/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders();

  const data = readDatabase();
  res.write(`data: ${JSON.stringify({ updatedAt: data.updatedAt })}\n\n`);
  sseClients.add(res);

  req.on("close", () => {
    sseClients.delete(res);
  });
});

app.post("/api/admin/login", (req, res) => {
  const { username, password } = req.body || {};

  if (!safeEqual(username, ADMIN_USERNAME) || !safeEqual(password, ADMIN_PASSWORD)) {
    return res.status(401).json({ error: "Invalid username or password" });
  }

  const token = generateToken();
  sessions.set(token, {
    username: ADMIN_USERNAME,
    expiresAt: Date.now() + SESSION_TTL_MS
  });

  res.json({
    token,
    expiresIn: SESSION_TTL_MS
  });
});

app.post("/api/admin/upload", requireAuth, upload.single("image"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file received" });
  }

  res.json({
    url: `/uploads/${req.file.filename}`
  });
});

app.post("/api/admin/content", requireAuth, (req, res) => {
  const current = readDatabase();
  const nextData = {
    ...current,
    text: {
      ...current.text,
      ...(req.body.text || {})
    },
    images: {
      ...current.images,
      ...(req.body.images || {})
    },
    sections: {
      ...(current.sections || {}),
      ...(req.body.sections || {})
    },
    updatedAt: new Date().toISOString()
  };

  writeDatabase(nextData);
  broadcastUpdate(nextData.updatedAt);

  res.json({
    success: true,
    updatedAt: nextData.updatedAt,
    data: nextData
  });
});

app.get("/admin", (_req, res) => {
  res.sendFile(path.join(ROOT_DIR, "admin.html"));
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(ROOT_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Admin CMS server running at http://localhost:${PORT}`);
  console.log(`Admin page: http://localhost:${PORT}/admin.html`);
});
