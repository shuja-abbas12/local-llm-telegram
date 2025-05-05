const { startEventHub } = require("./eventHub");
startEventHub(4000); // starts WS hub before anything else

const express = require("express");
const app = express();
app.use(express.json());

app.use("/api/llm", require("./llmProxy")); // /models and /generate
app.get("/healthz", (_, r) => r.send("OK"));

app.listen(3000, () => console.log("✅ Backend up on http://localhost:3000"));
