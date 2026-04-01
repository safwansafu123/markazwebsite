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
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_OWNER = process.env.GITHUB_OWNER || "safwansafu123";
const GITHUB_REPO = process.env.GITHUB_REPO || "markazwebsite";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";
const sessions = new Map();
const sseClients = new Set();

function parseCookies(req) {
  const header = req.headers.cookie || "";
  return header.split(";").reduce((acc, part) => {
    const [rawKey, ...rawValue] = part.trim().split("=");
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rawValue.join("=") || "");
    return acc;
  }, {});
}

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

function getSessionToken(req) {
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  const cookies = parseCookies(req);
  return cookies.admin_session || "";
}

function getValidSession(req) {
  pruneSessions();
  const token = getSessionToken(req);
  if (!token) return null;

  const session = sessions.get(token);
  if (!session || session.expiresAt <= Date.now()) {
    sessions.delete(token);
    return null;
  }

  return { token, session };
}

function broadcastUpdate(updatedAt) {
  const payload = `data: ${JSON.stringify({ updatedAt })}\n\n`;
  for (const client of sseClients) {
    client.write(payload);
  }
}

function isGitHubSyncEnabled() {
  return Boolean(GITHUB_TOKEN && GITHUB_OWNER && GITHUB_REPO && GITHUB_BRANCH);
}

async function githubRequest(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {})
    }
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub sync failed (${response.status}): ${text}`);
  }

  return response;
}

async function getGitHubFileSha(repoPath) {
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURIComponent(repoPath).replace(/%2F/g, "/")}?ref=${encodeURIComponent(GITHUB_BRANCH)}`;
  const response = await fetch(url, {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${GITHUB_TOKEN}`,
      "X-GitHub-Api-Version": "2022-11-28"
    }
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`GitHub lookup failed (${response.status}): ${text}`);
  }

  const payload = await response.json();
  return payload.sha || null;
}

async function upsertGitHubFile(repoPath, fileContent, commitMessage) {
  if (!isGitHubSyncEnabled()) {
    return { skipped: true };
  }

  const sha = await getGitHubFileSha(repoPath);
  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURIComponent(repoPath).replace(/%2F/g, "/")}`;
  const contentBase64 = Buffer.isBuffer(fileContent)
    ? fileContent.toString("base64")
    : Buffer.from(String(fileContent), "utf8").toString("base64");

  const body = {
    message: commitMessage,
    content: contentBase64,
    branch: GITHUB_BRANCH
  };

  if (sha) {
    body.sha = sha;
  }

  await githubRequest(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  return { skipped: false };
}

function requireAuth(req, res, next) {
  const validSession = getValidSession(req);

  if (!validSession) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.session = validSession.session;
  req.sessionToken = validSession.token;
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

app.use(["/admin-dashboard", "/admin-dashboard.html"], (req, res, next) => {
  if (!getValidSession(req)) {
    return res.redirect("/admin-login.html");
  }
  next();
});

app.use(["/admin", "/admin-login", "/admin-login.html"], (req, res, next) => {
  if (getValidSession(req)) {
    return res.redirect("/admin-dashboard.html");
  }
  next();
});

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

  res.setHeader(
    "Set-Cookie",
    `admin_session=${token}; HttpOnly; Path=/; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}; SameSite=Lax`
  );

  res.json({
    token,
    expiresIn: SESSION_TTL_MS
  });
});

app.post("/api/admin/logout", (req, res) => {
  const validSession = getValidSession(req);
  if (validSession) {
    sessions.delete(validSession.token);
  }

  res.setHeader(
    "Set-Cookie",
    "admin_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax"
  );

  res.json({ success: true });
});

app.post("/api/admin/upload", requireAuth, upload.single("image"), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No image file received" });
  }

  const imageUrl = `/uploads/${req.file.filename}`;

  try {
    await upsertGitHubFile(
      `uploads/${req.file.filename}`,
      fs.readFileSync(req.file.path),
      `chore(admin): update uploaded asset ${req.file.filename}`
    );

    res.json({
      url: imageUrl,
      githubSync: isGitHubSyncEnabled()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post("/api/admin/content", requireAuth, async (req, res) => {
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

  try {
    writeDatabase(nextData);
    await upsertGitHubFile(
      "database.json",
      JSON.stringify(nextData, null, 2),
      `chore(admin): update site content ${nextData.updatedAt}`
    );
    broadcastUpdate(nextData.updatedAt);

    res.json({
      success: true,
      updatedAt: nextData.updatedAt,
      data: nextData,
      githubSync: isGitHubSyncEnabled()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get("/admin", (_req, res) => {
  res.sendFile(path.join(ROOT_DIR, "admin-login.html"));
});

app.get("/admin-dashboard", (_req, res) => {
  res.sendFile(path.join(ROOT_DIR, "admin-dashboard.html"));
});

app.get("/", (_req, res) => {
  res.sendFile(path.join(ROOT_DIR, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Admin CMS server running at http://localhost:${PORT}`);
  console.log(`Admin login: http://localhost:${PORT}/admin-login.html`);
  console.log(`Admin dashboard: http://localhost:${PORT}/admin-dashboard.html`);
  console.log(
    isGitHubSyncEnabled()
      ? `GitHub sync enabled for ${GITHUB_OWNER}/${GITHUB_REPO}@${GITHUB_BRANCH}`
      : "GitHub sync disabled. Set GITHUB_TOKEN, GITHUB_OWNER, GITHUB_REPO, and GITHUB_BRANCH to enable it."
  );
});
