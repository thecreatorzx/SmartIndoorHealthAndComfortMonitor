import { state } from "../state/state.js";
import db from "../config/db.js";

const DEFAULT_HISTORY = 20;
const MAX_HISTORY = 500;

export function setupSocketIO(io) {
  io.on("connection", async (socket) => {
    console.log("Dashboard connected:", socket.id);

    async function fetchHistory(quantity = DEFAULT_HISTORY) {
      const limit = Math.min(Math.max(1, quantity), MAX_HISTORY);
      const { rows: devices } = await db.query(
        `SELECT id, device_code FROM devices WHERE user_id = $1`,
        [socket.user.userId],
      );

      const entries = await Promise.all(
        devices.map(async (device) => {
          try {
            const { rows } = await db.query(
              `SELECT * FROM readings
               WHERE device_id = $1
               ORDER BY recorded_at DESC
               LIMIT $2`,
              [device.id, limit],
            );
            return [device.device_code, rows.reverse()];
          } catch (err) {
            console.error(
              "Error fetching history for",
              device.device_code,
              err.message,
            );
            return [device.device_code, []];
          }
        }),
      );

      return Object.fromEntries(entries);
    }

    async function getStatus() {
      const { rows: devices } = await db.query(
        `SELECT id, device_code FROM devices WHERE user_id = $1`,
        [socket.user.userId],
      );

      const status = {};
      for (const device of devices) {
        const live = state.devices.get(device.device_code);
        status[device.device_code] = {
          connected: !!live,
          lastSeen: live?.lastSeen ?? null,
          readingsCount: live?.readings.length ?? 0,
        };
      }
      return status;
    }

    // Send full initial state on connect
    try {
      const [history, status] = await Promise.all([
        fetchHistory(),
        getStatus(),
      ]);
      socket.emit("sensor-history", history);
      socket.emit("esp32-status", status);
    } catch (err) {
      console.error("Failed to send initial state to dashboard:", err.message);
      socket.emit("error", { message: "Failed to load initial state" });
    }

    socket.on("get-history", async ({ quantity } = {}) => {
      try {
        const history = await fetchHistory(quantity);
        socket.emit("sensor-history", history);
      } catch (err) {
        console.error("Error fetching history:", err.message);
        socket.emit("error", { message: "Failed to fetch sensor history" });
      }
    });

    socket.on("get-status", async () => {
      try {
        const status = await getStatus();
        socket.emit("esp32-status", status);
      } catch (err) {
        console.error("Error fetching status:", err.message);
        socket.emit("error", { message: "Failed to fetch ESP32 status" });
      }
    });

    socket.on("disconnect", () => {
      console.log("Dashboard disconnected:", socket.id);
    });
  });
}
