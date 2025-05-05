const { WebSocketServer } = require("ws");
const clients = new Set();

function startEventHub(serverPort = 4000) {
  const wss = new WebSocketServer({ port: serverPort });
  wss.on("connection", (ws) => {
    clients.add(ws);
    ws.on("close", () => clients.delete(ws));
  });
  console.log(`📣  WebSocket hub on ws://localhost:${serverPort}`);
}

function broadcast(event) {
  const data = JSON.stringify(event);
  for (const ws of clients) {
    if (ws.readyState === ws.OPEN) ws.send(data);
  }
}

module.exports = { startEventHub, broadcast };
