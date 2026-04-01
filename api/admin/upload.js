const crypto = require("crypto");
const path = require("path");
const {
  getPublicUploadUrl,
  getSessionFromRequest,
  isGitHubSyncEnabled,
  readBody,
  sendJson,
  upsertGitHubFile
} = require("../_lib/admin");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  if (!getSessionFromRequest(req)) {
    return sendJson(res, 401, { error: "Unauthorized" });
  }

  try {
    const body = await readBody(req);
    const { filename, contentBase64 } = body || {};

    if (!filename || !contentBase64) {
      return sendJson(res, 400, { error: "Missing filename or file content" });
    }

    const extension = path.extname(filename) || ".jpg";
    const safeName = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${extension}`;
    const fileBuffer = Buffer.from(contentBase64, "base64");

    await upsertGitHubFile(
      `uploads/${safeName}`,
      fileBuffer,
      `chore(admin): update uploaded asset ${safeName}`
    );

    return sendJson(res, 200, {
      url: getPublicUploadUrl(safeName),
      githubSync: isGitHubSyncEnabled()
    });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
};
