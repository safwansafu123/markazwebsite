const crypto = require("crypto");

const GITHUB_TOKEN = process.env.GITHUB_TOKEN || "";
const GITHUB_OWNER = process.env.GITHUB_OWNER || "safwansafu123";
const GITHUB_REPO = process.env.GITHUB_REPO || "markazwebsite";
const GITHUB_BRANCH = process.env.GITHUB_BRANCH || "main";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "admin";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "ChangeMe123!";
const ADMIN_SECRET = process.env.ADMIN_SECRET || "change-this-secret";
const SESSION_TTL_MS = 12 * 60 * 60 * 1000;

function safeEqual(a, b) {
  const aBuffer = Buffer.from(String(a));
  const bBuffer = Buffer.from(String(b));
  if (aBuffer.length !== bBuffer.length) return false;
  return crypto.timingSafeEqual(aBuffer, bBuffer);
}

function parseCookies(req) {
  const header = req.headers.cookie || "";
  return header.split(";").reduce((acc, part) => {
    const [rawKey, ...rest] = part.trim().split("=");
    if (!rawKey) return acc;
    acc[rawKey] = decodeURIComponent(rest.join("=") || "");
    return acc;
  }, {});
}

function createSessionToken(username) {
  const payload = {
    username,
    exp: Date.now() + SESSION_TTL_MS
  };
  const encoded = Buffer.from(JSON.stringify(payload), "utf8").toString("base64url");
  const signature = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(encoded)
    .digest("base64url");
  return `${encoded}.${signature}`;
}

function verifySessionToken(token) {
  if (!token || !token.includes(".")) return null;
  const [encoded, signature] = token.split(".");
  const expected = crypto
    .createHmac("sha256", ADMIN_SECRET)
    .update(encoded)
    .digest("base64url");

  if (!safeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8"));
    if (!payload.exp || payload.exp <= Date.now()) return null;
    return payload;
  } catch (_error) {
    return null;
  }
}

function getSessionFromRequest(req) {
  const authHeader = req.headers.authorization || "";
  if (authHeader.startsWith("Bearer ")) {
    return verifySessionToken(authHeader.slice(7));
  }

  const cookies = parseCookies(req);
  return verifySessionToken(cookies.admin_session || "");
}

function setSessionCookie(res, token) {
  res.setHeader(
    "Set-Cookie",
    `admin_session=${token}; HttpOnly; Path=/; Max-Age=${Math.floor(SESSION_TTL_MS / 1000)}; SameSite=Lax; Secure`
  );
}

function clearSessionCookie(res) {
  res.setHeader(
    "Set-Cookie",
    "admin_session=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax; Secure"
  );
}

function sendJson(res, statusCode, payload) {
  res.statusCode = statusCode;
  res.setHeader("Content-Type", "application/json");
  res.end(JSON.stringify(payload));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (chunk) => {
      raw += chunk;
    });
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (error) {
        reject(error);
      }
    });
    req.on("error", reject);
  });
}

function isGitHubSyncEnabled() {
  return Boolean(GITHUB_TOKEN && GITHUB_OWNER && GITHUB_REPO && GITHUB_BRANCH);
}

async function githubFetch(url, options = {}) {
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
    throw new Error(`GitHub request failed (${response.status}): ${text}`);
  }

  return response;
}

async function getGitHubFile(repoPath) {
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

  return response.json();
}

async function readDatabase() {
  if (isGitHubSyncEnabled()) {
    const file = await getGitHubFile("database.json");
    if (file && file.content) {
      return JSON.parse(Buffer.from(file.content, "base64").toString("utf8"));
    }
  }

  const localData = require("../../database.json");
  return JSON.parse(JSON.stringify(localData));
}

async function upsertGitHubFile(repoPath, fileContent, commitMessage) {
  if (!isGitHubSyncEnabled()) {
    throw new Error("GitHub sync is not configured on Vercel.");
  }

  const existing = await getGitHubFile(repoPath);
  const contentBase64 = Buffer.isBuffer(fileContent)
    ? fileContent.toString("base64")
    : Buffer.from(String(fileContent), "utf8").toString("base64");

  const body = {
    message: commitMessage,
    content: contentBase64,
    branch: GITHUB_BRANCH
  };

  if (existing && existing.sha) {
    body.sha = existing.sha;
  }

  const url = `https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${encodeURIComponent(repoPath).replace(/%2F/g, "/")}`;
  await githubFetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });
}

function getPublicUploadUrl(filename) {
  return `https://raw.githubusercontent.com/${GITHUB_OWNER}/${GITHUB_REPO}/${GITHUB_BRANCH}/uploads/${filename}`;
}

module.exports = {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
  clearSessionCookie,
  createSessionToken,
  getPublicUploadUrl,
  getSessionFromRequest,
  isGitHubSyncEnabled,
  parseCookies,
  readBody,
  readDatabase,
  safeEqual,
  sendJson,
  setSessionCookie,
  upsertGitHubFile
};
