const express = require("express");
const axios = require("axios");
const router = express.Router();

const host = process.env.OLLAMA_HOST || "http://localhost:11434";

// GET /api/llm/models … unchanged

// POST /api/llm/generate  { prompt, model, stream? }
router.post("/generate", async (req, res) => {
  const { prompt, model, stream = false } = req.body || {};
  if (!prompt || !model) {
    return res
      .status(400)
      .json({ error: "Both 'prompt' and 'model' are required." });
  }

  try {
    const r = await axios.post(
      `${host}/api/generate`,
      { model, prompt, stream },
      { responseType: stream ? "stream" : "json" }
    );

    if (stream) {
      // real-time stream if client asked for it
      r.data.pipe(res);
    } else {
      // one-shot JSON
      return res.json(r.data);
    }
  } catch (e) {
    console.error("LLM error:", e.response?.status, e.message);
    return res.status(502).json({ error: "Upstream LLM failed" });
  }
});

module.exports = router;
