import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import "dotenv/config";
import cookieParser from "cookie-parser";

import { setupESP32 } from "./sockets/esp32.js";
import { setupSocketIO } from "./sockets/socketio.js";
import { state } from "./state/state.js";
import deviceRouter from "./routes/devices.js";
import authRouter from "./routes/auth.js";
import { authMiddleware } from "./middleware/auth.js";
import cors from "cors";

const PORT = process.env.PORT || 3000;
const ESP_PATH = process.env.ESP_PATH || "/esp32";

const app = express();
const server = createServer(app);

app.use(express.json());
app.use(cookieParser());
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);
app.use("/auth", authRouter);
app.use(authMiddleware);
app.use("/devices", deviceRouter);

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
    credentials: true,
  },
});

setupESP32(server, io, ESP_PATH);
setupSocketIO(io);

// ✅ timeout monitor — checks all connected devices
const TIMEOUT = 10000;
setInterval(() => {
  const now = Date.now();

  state.devices.forEach((device, deviceCode) => {
    const delta = now - device.lastSeen;

    if (delta > TIMEOUT) {
      console.log(`ESP32 ${deviceCode} timeout: ${(delta / 1000).toFixed(1)}s`);

      io.emit("alert", {
        type: "timeout",
        deviceCode,
        message: `ESP32 ${deviceCode} not responding`,
        lastSeen: device.lastSeen,
        timeSinceLastMessage: delta,
      });
    }
  });
}, 5000);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`ESP32 → ws://localhost:${PORT}${ESP_PATH}`);
});

// ✅ shutdown — closes all device connections
const shutdown = () => {
  console.log("\nShutting down...");

  state.devices.forEach((device, deviceCode) => {
    if (device.ws.readyState === device.ws.OPEN) {
      device.ws.close(1000, "Server shutting down");
      console.log(`Closed connection for ${deviceCode}`);
    }
  });

  io.close();

  server.close(() => {
    console.log("Server closed");
    process.exit(0);
  });

  setTimeout(() => process.exit(1), 5000);
};

process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);
