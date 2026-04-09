const {
  getSessionFromRequest,
  isGitHubSyncEnabled,
  readBody,
  readDatabase,
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
    const current = await readDatabase();
    const nextData = {
      ...current,
      text: {
        ...current.text,
        ...(body.text || {})
      },
      images: {
        ...current.images,
        ...(body.images || {})
      },
      sections: {},
      updatedAt: new Date().toISOString()
    };

    await upsertGitHubFile(
      "database.json",
      JSON.stringify(nextData, null, 2),
      `chore(admin): update site content ${nextData.updatedAt}`
    );

    return sendJson(res, 200, {
      success: true,
      updatedAt: nextData.updatedAt,
      data: nextData,
      githubSync: isGitHubSyncEnabled()
    });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
};
