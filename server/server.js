const express = require("express");
const cors = require("cors");
const http = require("http");
const { WebSocketServer } = require("ws");
const symbols = require("./symbols");

const PORT = process.env.PORT || 4000;
// how often the server tries to move prices (in ms)
const TICK_INTERVAL_MS = Number(process.env.TICK_INTERVAL_MS) || 250;

const app = express();
app.use(cors());

// current price of every symbol, this changes on every tick
const prices = {};
for (const item of symbols) {
  prices[item.symbol] = item.price;
}

// REST endpoint: list of all symbols that can be added to a watchlist
app.get("/api/symbols", (req, res) => {
  const list = symbols.map((item) => {
    return {
      symbol: item.symbol,
      name: item.name,
      prevClose: item.price,
    };
  });
  res.json(list);
});

const server = http.createServer(app);
const wss = new WebSocketServer({ server: server, path: "/ws" });

function sendTick(socket, symbol) {
  const message = {
    type: "tick",
    tick: {
      symbol: symbol,
      price: prices[symbol],
      time: Date.now(),
    },
  };
  socket.send(JSON.stringify(message));
}

wss.on("connection", (socket) => {
  // every client has its own set of subscribed symbols
  socket.subscriptions = new Set();

  socket.on("message", (raw) => {
    let message;
    try {
      message = JSON.parse(raw.toString());
    } catch (err) {
      return; // ignore anything that is not JSON
    }

    if (!Array.isArray(message.symbols)) {
      return;
    }

    if (message.type === "subscribe") {
      for (const symbol of message.symbols) {
        if (prices[symbol] === undefined) continue;
        socket.subscriptions.add(symbol);
        // send the current price right away so the client is not waiting
        sendTick(socket, symbol);
      }
    }

    if (message.type === "unsubscribe") {
      for (const symbol of message.symbols) {
        socket.subscriptions.delete(symbol);
      }
    }
  });
});

// move a price up or down by a small random amount (max 0.15%)
function movePrice(symbol) {
  const change = (Math.random() - 0.5) * 0.003;
  const newPrice = prices[symbol] * (1 + change);
  prices[symbol] = Math.round(newPrice * 100) / 100;
}

setInterval(() => {
  for (const item of symbols) {
    // not every symbol trades on every interval
    if (Math.random() > 0.6) continue;

    movePrice(item.symbol);

    // only send the tick to clients that subscribed to this symbol
    wss.clients.forEach((socket) => {
      if (socket.readyState !== 1) return; // 1 means OPEN
      if (socket.subscriptions.has(item.symbol)) {
        sendTick(socket, item.symbol);
      }
    });
  }
}, TICK_INTERVAL_MS);

server.listen(PORT, () => {
  console.log("Mock market server running on port " + PORT);
});
