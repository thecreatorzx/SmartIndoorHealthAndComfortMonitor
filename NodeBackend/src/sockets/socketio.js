import { state } from "../state/state.js";
import db from "../config/db.js";
const DEFAULT_HISTORY = 20;
const MAX_HISTORY = 500;

export function setupSocketIO(io) {
  io.on("connection", async (socket) => {
    console.log("Dashboard connected:", socket.id);

    async function fetchHistory(quantity = DEFAULT_HISTORY) {
      const limit = Math.min(Math.max(1, quantity), MAX_HISTORY); // clamp between 1 and 500
      const result = {};

      for (const [deviceCode, device] of state.devices) {
        try {
          const res = await db.query(
            `SELECT * FROM readings 
             WHERE device_id = $1
             ORDER BY recorded_at DESC
             LIMIT $2`,
            [device.deviceId, limit], // ✅ use stored deviceId, no subquery needed
          );
          result[deviceCode] = res.rows.reverse(); // oldest first
        } catch (err) {
          console.error("Error fetching history for", deviceCode, err.message);
          result[deviceCode] = [];
        }
      }
      return result;
    }

    function getStatus() {
      const status = {};
      state.devices.forEach((device, deviceCode) => {
        status[deviceCode] = {
          connected: device.ws.readyState === 1,
          lastSeen: device.lastSeen,
          readingsCount: device.readings.length,
        };
      });
      return status;
    }

    // send initial state on connect
    const [history, status] = await Promise.all([
      fetchHistory(),
      Promise.resolve(getStatus()),
    ]);
    socket.emit("sensor-history", history);
    socket.emit("esp32-status", status);

    socket.on("get-history", async ({ quantity } = {}) => {
      const history = await fetchHistory(quantity);
      socket.emit("sensor-history", history);
    });

    socket.on("get-status", () => {
      socket.emit("esp32-status", getStatus());
    });

    socket.on("disconnect", () => {
      console.log("Dashboard disconnected:", socket.id);
    });
  });
}
