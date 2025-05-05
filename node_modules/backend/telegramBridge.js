// backend/telegramBridge.js
const path = require("path");
// Tell dotenv exactly where to find your .env
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const { Telegraf }        = require("telegraf");
const { SocksProxyAgent } = require("socks-proxy-agent");
const axios               = require("axios");
const { broadcast }       = require("./eventHub");

// Build a proxy agent if PROXY_URL is set in .env
const proxyUrl      = process.env.PROXY_URL;
const telegramAgent = proxyUrl ? new SocksProxyAgent(proxyUrl) : undefined;

// Ensure we have a bot token (now loaded from root .env)
const token = process.env.TELEGRAM_TOKEN;
if (!token) {
  console.error("❌ Missing TELEGRAM_TOKEN in .env");
  process.exit(1);
}

// Instantiate the bot with the proxy agent
const bot = new Telegraf(token, {
  telegram: { agent: telegramAgent }
});

// Log that we see the token (for debugging)
console.log("🔑 TELEGRAM_TOKEN detected:", token ? "[FOUND]" : "[MISSING]");

// Handle incoming text messages
bot.on("text", async (ctx) => {
  const userMsg = ctx.message.text;
  const chatId  = ctx.chat.id;

  console.log(`🟢 [BRIDGE] Inbound from ${chatId}: ${userMsg}`);
  broadcast({ dir: "in",  user: chatId, text: userMsg, ts: Date.now() });

  try {
    // Forward to your LLM proxy
    const { data } = await axios.post(
      "http://localhost:3000/api/llm/generate",
      { prompt: userMsg, model: "llama2:7b", stream: false }
    );

    const reply = data.response || data;
    console.log(`🔵 [BRIDGE] Outbound to ${chatId}: ${reply}`);

    await ctx.reply(reply);
    broadcast({ dir: "out", user: chatId, text: reply, ts: Date.now() });
  } catch (err) {
    console.error("🔴 [BRIDGE] Error:", err.message);
    await ctx.reply("⚠️ Sorry, I couldn’t reach the LLM.");
  }
});

// Launch the bot in polling mode
bot.launch()
  .then(() => console.log("🤖 Telegram bridge polling every 1 s"))
  .catch(err => console.error("❌ Telegram launch failed:", err.message));

// Graceful shutdown handlers
process.once("SIGINT",  () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));
