// schedulers/alert_scheduler.js

import db from "../config/db.js";
import { state } from "../state/state.js";

const ESCALATION_MINUTES = 30; // warning → critical after 30 min
const STALE_OFFLINE_MINUTES = 15; // close open exposures if device offline > 15 min

export function startAlertScheduler(io) {
  setInterval(async () => {
    try {
      // ─── 1. Escalate lingering warnings to critical ───────────────────────
      // If a WARNING exposure has been open > ESCALATION_MINUTES, bump severity
      const { rows: lingering } = await db.query(
        `UPDATE exposure_events
         SET severity = 'critical'
         WHERE resolved = FALSE
           AND severity = 'warning'
           AND start_time < NOW() - INTERVAL '1 minute' * $1
         RETURNING id, device_id, type`,
        [ESCALATION_MINUTES],
      );

      for (const row of lingering) {
        // Also update any open alert tied to this exposure
        await db.query(
          `UPDATE alerts SET severity = 'critical'
           WHERE exposure_id = $1 AND acknowledged = FALSE`,
          [row.id],
        );

        // Notify dashboard of the escalation
        io.emit("alert", {
          type: "escalation",
          deviceId: row.device_id,
          exposureId: row.id,
          exposureType: row.type,
          message: `Exposure ${row.type} escalated to critical after ${ESCALATION_MINUTES} min`,
        });
      }

      // ─── 2. Auto-close stale exposures for offline devices ───────────────
      // If a device has been gone for > STALE_OFFLINE_MINUTES and still has
      // open exposures in the DB (e.g. server restarted mid-breach), close them
      const { rows: staleExposures } = await db.query(
        `SELECT e.id, e.device_id, d.device_code
         FROM exposure_events e
         JOIN devices d ON d.id = e.device_id
         WHERE e.resolved = FALSE
           AND e.start_time < NOW() - INTERVAL '1 minute' * $1`,
        [STALE_OFFLINE_MINUTES],
      );

      for (const row of staleExposures) {
        const isLive = state.devices.has(row.device_code);
        if (!isLive) {
          // Device is offline and exposure is still open — close it
          await db.query(
            `UPDATE exposure_events
             SET end_time = NOW(),
                 duration_minutes = EXTRACT(EPOCH FROM (NOW() - start_time)) / 60,
                 resolved = TRUE
             WHERE id = $1`,
            [row.id],
          );
        }
      }

      // ─── 3. Emit unacknowledged alert counts to dashboard ─────────────────
      // Lets the frontend badge update without polling REST
      const { rows: counts } = await db.query(
        `SELECT d.device_code, COUNT(a.id) AS unread
         FROM devices d
         LEFT JOIN alerts a ON a.device_id = d.id AND a.acknowledged = FALSE
         GROUP BY d.device_code`,
      );

      const summary = Object.fromEntries(
        counts.map((r) => [r.device_code, parseInt(r.unread, 10)]),
      );
      io.emit("alert-counts", summary);
    } catch (err) {
      console.error("Alert scheduler error:", err.message);
    }
  }, 60 * 1000); // runs every minute
}
