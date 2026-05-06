import { state } from "../state/state.js";
import {
  digestGeneratedToday,
  getRecentReadings,
  storeAiInsight,
} from "../config/db.js";
import { generateDailyDigest } from "../services/gemini.service.js";

export function startDigestScheduler(io) {
  setInterval(
    async () => {
      for (const [deviceCode, device] of state.devices) {
        try {
          const alreadyDone = await digestGeneratedToday(device.deviceId);
          if (alreadyDone) continue;

          const readings = await getRecentReadings(device.deviceId, 50);
          if (!readings.length) continue;

          const insight = await generateDailyDigest(deviceCode, readings);
          if (!insight) continue;

          const insightId = await storeAiInsight(device.deviceId, insight);
          io.emit("ai-insight", { deviceCode, insightId, ...insight });
        } catch (err) {
          console.error(`Digest error [${deviceCode}]:`, err.message);
        }
      }
    },
    60 * 60 * 1000,
  );
}
