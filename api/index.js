"use strict";
module.exports = async function handler(req, res) {
  let app;
  try {
    app = require("./app.cjs");
  } catch (err) {
    const detail = err && err.stack ? err.stack : String(err);
    console.error("[api] failed to load app.cjs:", detail);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "API bundle failed to load", code: "api_bundle_load_failed", detail: String(detail).slice(0, 800) }));
    }
    return;
  }
  if (typeof app !== "function") {
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "API bundle export is not a function", code: "api_bundle_bad_export" }));
    }
    return;
  }
  return app(req, res);
};
