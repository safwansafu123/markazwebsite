const { readDatabase, sendJson } = require("./_lib/admin");

module.exports = async (req, res) => {
  if (req.method !== "GET") {
    return sendJson(res, 405, { error: "Method not allowed" });
  }

  try {
    const data = await readDatabase();
    return sendJson(res, 200, data);
  } catch (error) {
    return sendJson(res, 500, { error: error.message });
  }
};
