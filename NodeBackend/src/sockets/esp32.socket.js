import { WebSocketServer } from "ws";
import { state } from "../state/state.js";
import {
  storeReading,
  isRegisteredDevice,
  openExposureEvent,
  closeExposureEvent,
  updateExposureMax,
  createAlert,
  storeComfortScore,
  recentBreachInsightExists,
  storeAiInsight,
} from "../config/db.js";
import { checkThresholds } from "../config/threshold.js";
import { generateBreachInsight } from "../services/gemini.service.js";

// ─── Comfort Score ────────────────────────────────────────────────────────────

function computeComfortScore(breaches) {
  let score = 100;
  for (const severity of Object.values(breaches)) {
    if (severity === "critical") score -= 25;
    else if (severity === "warning") score -= 10;
  }
  return Math.max(0, score);
}

// ─── Aggregation ──────────────────────────────────────────────────────────────

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

// ─── Exposure Lifecycle ───────────────────────────────────────────────────────

async function handleExposures(deviceId, deviceCode, reading, breaches) {
  const device = state.devices.get(deviceCode);
  if (!device) return;

  for (const [field, severity] of Object.entries(breaches)) {
    const activeId = device.activeExposures.get(field);

    if (severity !== null) {
      const exposureType = `${severity.toUpperCase()}_${field.toUpperCase()}`; // e.g. CRITICAL_CO2

      if (!activeId) {
        // New breach — open exposure and create alert
        const exposureId = await openExposureEvent(
          deviceId,
          exposureType,
          reading[field],
          severity,
        );
        device.activeExposures.set(field, exposureId);
        const fieldLabel = field.replace("_", " ");
        await createAlert(
          deviceId,
          exposureId,
          `${fieldLabel.charAt(0).toUpperCase() + fieldLabel.slice(1)} ${severity}`,
          `${fieldLabel} is at ${reading[field]} — ${severity} threshold exceeded.`,
          severity,
        );
      } else {
        // Ongoing breach — update max value if condition worsened
        await updateExposureMax(activeId, reading[field]);
      }
    } else {
      if (activeId) {
        // Condition recovered — close the exposure
        await closeExposureEvent(activeId);
        device.activeExposures.delete(field);
      }
    }
  }
}

async function closeAllExposures(deviceCode) {
  const device = state.devices.get(deviceCode);
  if (!device) return;

  for (const [, exposureId] of device.activeExposures) {
    await closeExposureEvent(exposureId).catch((err) =>
      console.error("Failed to close exposure on disconnect:", err.message),
    );
  }
  device.activeExposures.clear();
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function sendToDevice(ws, type, payload = {}) {
  if (ws.readyState === ws.OPEN) {
    ws.send(JSON.stringify({ type, ...payload }));
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function setupESP32(server, io, path) {
  const wss = new WebSocketServer({ server, path });

  wss.on("connection", (ws) => {
    console.log("New ESP32 connection");

    let deviceCode = null;
    let isRegistered = false;
    let flushTimeout = null;
    let lastComfortStore = 0;

    const registrationTimeout = setTimeout(() => {
      if (!isRegistered) {
        sendToDevice(ws, "error", { reason: "Registration timeout" });
        ws.close();
      }
    }, 10000);

    ws.on("message", async (rawData) => {
      try {
        const data = JSON.parse(rawData.toString());
        const { type } = data;

        // ─── REGISTRATION ──────────────────────────────────────────
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

          clearTimeout(registrationTimeout);
          deviceCode = code;
          isRegistered = true;

          state.devices.set(deviceCode, {
            ws,
            deviceId,
            lastSeen: Date.now(),
            readings: [],
            activeExposures: new Map(), // field → exposureId
          });

          sendToDevice(ws, "register:ack", { success: true, deviceCode });
          io.emit("esp32-status", {
            [deviceCode]: {
              connected: true,
              lastSeen: Date.now(),
              readingsCount: 0,
            },
          });
          console.log(`ESP32 registered: ${deviceCode}`);
          return;
        }

        // ─── GUARD ────────────────────────────────────────────────
        if (!isRegistered) {
          sendToDevice(ws, "error", {
            reason: "Not registered. Send a register message first.",
          });
          return;
        }

        // ─── DATA ─────────────────────────────────────────────────
        if (type === "data") {
          const device = state.devices.get(deviceCode);
          device.lastSeen = Date.now();

          const { type: _, timestamp: rawTs, ...fields } = data;
          const reading = {
            ...fields,
            timestamp: new Date(rawTs ?? new Date()),
          };

          // Threshold check
          const breaches = checkThresholds(reading);
          const hasAlerts = Object.values(breaches).some((v) => v !== null);

          // Comfort score derived from breaches
          const comfortScore = computeComfortScore(breaches);

          // Live dashboard update
          io.emit("sensor-update", { deviceCode, ...reading, comfortScore });

          // Broadcast alerts to dashboard
          if (hasAlerts) {
            io.emit("alert", {
              type: "threshold",
              deviceCode,
              breaches,
              timestamp: reading.timestamp,
            });
          }

          // Persist exposure lifecycle + alerts to DB
          handleExposures(device.deviceId, deviceCode, reading, breaches).catch(
            (err) => console.error("Exposure handling error:", err.message),
          );

          if (hasAlerts) {
            recentBreachInsightExists(
              device.deviceId,
              Object.keys(breaches).filter((k) => breaches[k] !== null),
              60,
            )
              .then((alreadyFired) => {
                if (alreadyFired) return null;
                return generateBreachInsight(deviceCode, reading, breaches);
              })
              .then((insight) => {
                if (!insight) return;
                return storeAiInsight(device.deviceId, insight).then(
                  (insightId) => {
                    io.emit("ai-insight", {
                      deviceCode,
                      insightId,
                      ...insight,
                    });
                  },
                );
              })
              .catch((err) =>
                console.error("Breach insight error:", err.message),
              );
          }

          device.readings.push(reading);
          if (device.readings.length > 50) device.readings.shift();

          // Throttled DB flush every 5 seconds
          if (!flushTimeout) {
            flushTimeout = setTimeout(() => {
              const aggregated = aggregateReadings(deviceCode);
              if (aggregated) {
                const liveDevice = state.devices.get(deviceCode);
                if (!liveDevice) return;

                storeReading(liveDevice.deviceId, aggregated).catch((err) =>
                  console.error("Failed to save reading:", err.message),
                );

                const aggregatedBreaches = checkThresholds(aggregated);
                const now = Date.now();
                if (now - lastComfortStore >= 60000) {
                  storeComfortScore(
                    liveDevice.deviceId,
                    computeComfortScore(aggregatedBreaches),
                  ).catch((err) =>
                    console.error("Failed to save comfort score:", err.message),
                  );
                  lastComfortStore = now;
                }

                liveDevice.readings = [];
              }
              flushTimeout = null;
            }, 5000);
          }

          return;
        }

        console.warn(`Unknown message type: ${type}`);
      } catch (err) {
        console.error(
          "Message handling error:",
          err.message,
          "| raw:",
          rawData.toString(),
        );
      }
    });

    ws.on("close", async () => {
      if (flushTimeout) clearTimeout(flushTimeout);
      if (deviceCode) {
        const aggregated = aggregateReadings(deviceCode);
        const liveDevice = state.devices.get(deviceCode);
        if (aggregated && liveDevice) {
          storeReading(liveDevice.deviceId, aggregated).catch((err) =>
            console.error("Failed to save final reading:", err.message),
          );
          const aggregatedBreaches = checkThresholds(aggregated);
          if (Date.now() - lastComfortStore >= 60000) {
            storeComfortScore(
              liveDevice.deviceId,
              computeComfortScore(aggregatedBreaches),
            ).catch((err) =>
              console.error("Failed to save final comfort score:", err.message),
            );
          }
        }
        await closeAllExposures(deviceCode);
        console.log(`ESP32 ${deviceCode} disconnected`);
        state.devices.delete(deviceCode);
        io.emit("esp32-status", {
          [deviceCode]: {
            connected: false,
            lastSeen: Date.now(),
            readingsCount: 0,
          },
        });
      }
    });

    ws.on("error", (err) => {
      console.error("ESP32 error:", err.message);
    });
  });
}
