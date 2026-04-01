const { clearSessionCookie, sendJson } = require("../_lib/admin");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  clearSessionCookie(res);
  return sendJson(res, 200, { success: true });
};
