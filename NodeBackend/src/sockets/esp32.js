import { WebSocketServer } from "ws";
import { state } from "../state/state.js";
import { storeReading, isRegisteredDevice } from "../config/db.js";
import { checkThresholds } from "../config/threshold.js";

function aggregateReadings(deviceCode) {
  const device = state.devices.get(deviceCode);
  if (!device || device.readings.length === 0) return null;

  const sumFields = {};
  const count = device.readings.length;

  for (const r of device.readings) {
    for (const key of Object.keys(r)) {
      if (key === "timestamp") continue;
      if (typeof r[key] === "number") {
        sumFields[key] = (sumFields[key] || 0) + r[key];
      }
    }
  }

  const aggregated = {};
  for (const key of Object.keys(sumFields)) {
    aggregated[key] = sumFields[key] / count;
  }
  aggregated.sample_count = count;
  aggregated.timestamp = new Date();
  return aggregated;
}

function sendToDevice(ws, type, payload = {}) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify({ type, ...payload }));
  }
}

export function setupESP32(server, io, path) {
  const wss = new WebSocketServer({ server, path });

  wss.on("connection", (ws) => {
    console.log("New ESP32 connection");

    let deviceCode = null;
    let isRegistered = false;
    let flushTimeout = null;

    ws.on("message", async (rawData) => {
      try {
        const data = JSON.parse(rawData.toString());
        const { type } = data;

        // ─── REGISTRATION ────────────────────────────────────────────
        if (type === "register") {
          const { deviceCode: code } = data;

          if (!code) {
            sendToDevice(ws, "register:ack", {
              success: false,
              reason: "Missing deviceCode",
            });
            ws.close();
            return;
          }

          const deviceId = await isRegisteredDevice(code);
          if (!deviceId) {
            sendToDevice(ws, "register:ack", {
              success: false,
              reason: "Unknown device",
            });
            ws.close();
            return;
          }

          if (state.devices.has(code) && state.devices.get(code).ws !== ws) {
            sendToDevice(ws, "register:ack", {
              success: false,
              reason: "Device already connected",
            });
            ws.close();
            return;
          }

          deviceCode = code;
          isRegistered = true;

          state.devices.set(deviceCode, {
            ws,
            deviceId,
            lastSeen: Date.now(),
            readings: [],
          });

          sendToDevice(ws, "register:ack", { success: true, deviceCode });
          io.emit("esp32-status", {
            deviceCode,
            connected: true,
            timestamp: Date.now(),
          });

          console.log(`ESP32 registered: ${deviceCode}`);
          return;
        }

        // ─── GUARD ───────────────────────────────────────────────────
        if (!isRegistered) {
          sendToDevice(ws, "error", {
            reason: "Not registered. Send a register message first.",
          });
          return;
        }

        // ─── DATA ────────────────────────────────────────────────────
        if (type === "data") {
          const device = state.devices.get(deviceCode);
          device.lastSeen = Date.now();

          const reading = {
            ...data,
            timestamp: new Date(data.timestamp ?? new Date()),
          };
          delete reading.type;
          device.readings.push(reading);

          if (device.readings.length > state.maxReadings) {
            device.readings.shift();
          }

          if (!flushTimeout) {
            flushTimeout = setTimeout(() => {
              const aggregated = aggregateReadings(deviceCode);
              if (aggregated) {
                const { deviceId } = state.devices.get(deviceCode);
                storeReading(deviceId, aggregated).catch((err) => {
                  console.error("Failed to save reading:", err.message);
                });
                io.emit("sensor-update", { deviceCode, ...aggregated });

                const breaches = checkThresholds(aggregated);
                const hasAlerts = Object.values(breaches).some(
                  (v) => v !== null,
                );
                if (hasAlerts) {
                  io.emit("alert", {
                    type: "threshold",
                    deviceCode,
                    breaches,
                    timestamp: aggregated.timestamp,
                  });
                }
              }
              flushTimeout = null;
            }, 5000);
          }

          return;
        }

        console.warn(`Unknown message type: ${type}`);
      } catch (err) {
        console.error("Invalid message:", rawData.toString());
      }
    });

    ws.on("close", () => {
      if (flushTimeout) clearTimeout(flushTimeout);
      if (deviceCode) {
        console.log(`ESP32 ${deviceCode} disconnected`);
        state.devices.delete(deviceCode);
        io.emit("esp32-status", {
          deviceCode,
          connected: false,
          timestamp: Date.now(),
        });
      }
    });

    ws.on("error", (err) => {
      console.error("ESP32 error:", err.message);
    });
  });
}
