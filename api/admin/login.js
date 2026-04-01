const {
  ADMIN_PASSWORD,
  ADMIN_USERNAME,
  createSessionToken,
  readBody,
  safeEqual,
  sendJson,
  setSessionCookie
} = require("../_lib/admin");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  try {
    const body = await readBody(req);
    const { username, password } = body || {};

    if (!safeEqual(username, ADMIN_USERNAME) || !safeEqual(password, ADMIN_PASSWORD)) {
      return sendJson(res, 401, { error: "Invalid username or password" });
    }

    const token = createSessionToken(ADMIN_USERNAME);
    setSessionCookie(res, token);
    return sendJson(res, 200, {
      token,
      ok: true
    });
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
};
