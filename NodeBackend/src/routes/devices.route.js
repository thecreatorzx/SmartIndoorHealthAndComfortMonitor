import { Router } from "express";
import { state } from "../state/state.js";
import db from "../config/db.js";
import { authMiddleware } from "../middleware/auth.middleware.js";
import {
  validate,
  createDeviceSchema,
  updateDeviceSchema,
} from "../utils/validate.js";

const router = Router();

router.get("/", authMiddleware, async (req, res, next) => {
  try {
    const { rows } = await db.query(
      `SELECT d.id, d.device_code, d.location, d.description, d.created_at,
              COUNT(a.id) FILTER (WHERE a.acknowledged = FALSE) AS unread_alerts
       FROM devices d
       LEFT JOIN alerts a ON a.device_id = d.id
       WHERE d.user_id = $1
       GROUP BY d.id
       ORDER BY d.created_at DESC`,
      [req.user.userId],
    );
    if (!rows.length) {
      return res.json([]);
    }
    const devices = rows.map((d) => ({
      ...d,
      unread_alerts: parseInt(d.unread_alerts, 10),
      connected: state.devices.has(d.device_code),
      lastSeen: state.devices.get(d.device_code)?.lastSeen ?? null,
    }));

    res.json(devices);
  } catch (err) {
    console.error("GET /devices error:", err.message);
    next(err);
  }
});

router.post(
  "/",
  authMiddleware,
  validate(createDeviceSchema),
  async (req, res, next) => {
    const { device_code, location, description } = req.body;
    try {
      const { rows } = await db.query(
        "INSERT INTO devices (device_code, location, description, user_id) VALUES ($1, $2, $3, $4) RETURNING id, device_code, location, description, created_at",
        [device_code, location ?? null, description ?? null, req.user.userId],
      );
      res.status(201).json(rows[0]);
    } catch (err) {
      console.log("POST /devices error: ", err.message);
      next(err);
    }
  },
);

router.get("/:code", authMiddleware, async (req, res, next) => {
  const { code } = req.params;
  try {
    const { rows } = await db.query(
      "SELECT id, device_code, location, description, created_at FROM devices WHERE device_code = $1 AND user_id = $2",
      [code, req.user.userId],
    );
    if (rows.length === 0) {
      const err = new Error("Device not found");
      err.status = 404;
      return next(err);
    }
    const device = rows[0];
    res.json({
      ...device,
      connected: state.devices.has(code),
      lastSeen: state.devices.get(code)?.lastSeen ?? null,
    });
  } catch (err) {
    console.error("GET /:code error:", err.message);
    return next(err);
  }
});

router.patch(
  "/:code",
  authMiddleware,
  validate(updateDeviceSchema),
  async (req, res, next) => {
    const { code } = req.params;
    const { location, description } = req.body;
    try {
      const { rows, rowCount } = await db.query(
        `UPDATE devices SET
         location = COALESCE($1, location),
         description = COALESCE($2, description)
       WHERE device_code = $3 AND user_id = $4
       RETURNING id, device_code, location, description`,
        [location ?? null, description ?? null, code, req.user.userId],
      );
      if (rowCount === 0) {
        const err = new Error("Device not found");
        err.status = 404;
        return next(err);
      }
      res.json(rows[0]);
    } catch (err) {
      console.error("PATCH /devices/:code error:", err.message);
      return next(err);
    }
  },
);

router.delete("/:code", authMiddleware, async (req, res, next) => {
  const { code } = req.params;

  try {
    const { rowCount } = await db.query(
      `DELETE FROM devices WHERE device_code = $1 AND user_id = $2`,
      [code, req.user.userId],
    );

    if (rowCount === 0) {
      const err = new Error("Device not found");
      err.status = 404;
      return next(err);
    }

    if (state.devices.has(code)) {
      const device = state.devices.get(code);
      if (device.ws.readyState === device.ws.OPEN) {
        device.ws.close(1000, "Device deleted");
      }
      state.devices.delete(code);
    }

    res.json({ message: `Device ${code} deleted` });
  } catch (err) {
    console.error("DELETE /devices/:code error:", err.message);
    return next(err);
  }
});

router.get("/:code/stats", authMiddleware, async (req, res, next) => {
  const { code } = req.params;
  try {
    const { rows } = await db.query(
      `SELECT d.id FROM devices d WHERE d.device_code = $1 AND d.user_id = $2`,
      [code, req.user.userId],
    );
    if (rows.length === 0) {
      const err = new Error("Device not found");
      err.status = 404;
      return next(err);
    }
    const deviceId = rows[0].id;

    const [latestReading, latestComfort, openExposures, unreadAlerts] =
      await Promise.all([
        db.query(
          `SELECT * FROM readings WHERE device_id = $1 ORDER BY recorded_at DESC LIMIT 1`,
          [deviceId],
        ),
        db.query(
          `SELECT score FROM comfort_scores WHERE device_id = $1 ORDER BY calculated_at DESC LIMIT 1`,
          [deviceId],
        ),
        db.query(
          `SELECT type, severity, start_time FROM exposure_events
         WHERE device_id = $1 AND resolved = FALSE ORDER BY start_time DESC`,
          [deviceId],
        ),
        db.query(
          `SELECT COUNT(*) AS count FROM alerts WHERE device_id = $1 AND acknowledged = FALSE`,
          [deviceId],
        ),
      ]);
    res.json({
      latest_reading: latestReading.rows[0] ?? null,
      comfort_score: latestComfort.rows[0]?.score ?? null,
      open_exposures: openExposures.rows,
      unread_alerts: parseInt(unreadAlerts.rows[0].count, 10),
      connected: state.devices.has(code),
      lastSeen: state.devices.get(code)?.lastSeen ?? null,
    });
  } catch (err) {
    console.error("GET /:code/stats error:", err.message);
    return next(err);
  }
});

router.get("/:code/readings", authMiddleware, async (req, res, next) => {
  const { code } = req.params;
  const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 20), 500);
  const offset = Math.max(0, parseInt(req.query.offset) || 0);

  try {
    const { rows } = await db.query(
      `SELECT r.*
       FROM readings r
       JOIN devices d ON d.id = r.device_id
       WHERE d.device_code = $1 AND d.user_id = $2
       ORDER BY r.recorded_at DESC
       LIMIT $3 OFFSET $4`,
      [code, req.user.userId, limit, offset],
    );
    res.json(rows.reverse());
  } catch (err) {
    console.error("GET /devices/:code/readings error:", err.message);
    return next(err);
  }
});

router.get("/:code/exposures", authMiddleware, async (req, res, next) => {
  const { code } = req.params;
  const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 50), 500);
  const offset = Math.max(0, parseInt(req.query.offset) || 0);
  try {
    const { rows } = await db.query(
      `SELECT e.*, COUNT(*) OVER() AS total_count
       FROM exposure_events e
       JOIN devices d ON d.id = e.device_id
       WHERE d.device_code = $1 AND d.user_id = $2
       ORDER BY e.start_time DESC
       LIMIT $3 OFFSET $4`,
      [code, req.user.userId, limit, offset],
    );
    res.json({
      data: rows,
      total: rows[0]?.total_count ?? 0,
      limit,
      offset,
    });
  } catch (err) {
    console.error("GET /:code/exposures error:", err.message);
    return next(err);
  }
});

router.get("/:code/alerts", authMiddleware, async (req, res, next) => {
  const { code } = req.params;
  const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 50), 500);
  const offset = Math.max(0, parseInt(req.query.offset) || 0);
  try {
    const { rows } = await db.query(
      `SELECT a.*, COUNT(*) OVER() AS total_count
       FROM alerts a
       JOIN devices d ON d.id = a.device_id
       WHERE d.device_code = $1 AND d.user_id = $2
       ORDER BY a.created_at DESC
       LIMIT $3 OFFSET $4`,
      [code, req.user.userId, limit, offset],
    );
    res.json({
      data: rows,
      total: rows[0]?.total_count ?? 0,
      limit,
      offset,
    });
  } catch (err) {
    console.error("GET /:code/alerts error:", err.message);
    return next(err);
  }
});

router.patch(
  "/:code/alerts/:id/acknowledge",
  authMiddleware,
  async (req, res, next) => {
    const { code, id } = req.params;
    try {
      const { rowCount } = await db.query(
        `UPDATE alerts a
       SET acknowledged = TRUE
       FROM devices d
       WHERE a.device_id = d.id
         AND a.id = $1
         AND d.device_code = $2
         AND d.user_id = $3`,
        [id, code, req.user.userId],
      );
      if (rowCount === 0) {
        const err = new Error("Alert not found");
        err.status = 404;
        return next(err);
      }
      res.json({ message: "Alert acknowledged" });
    } catch (err) {
      console.error("PATCH /:code/alerts/:id/acknowledge error:", err.message);
      return next(err);
    }
  },
);

router.get("/:code/comfort", authMiddleware, async (req, res, next) => {
  const { code } = req.params;
  const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 50), 500);
  const offset = Math.max(0, parseInt(req.query.offset) || 0);
  try {
    const { rows } = await db.query(
      `SELECT cs.*, COUNT(*) OVER() AS total_count
       FROM comfort_scores cs
       JOIN devices d ON d.id = cs.device_id
       WHERE d.device_code = $1 AND d.user_id = $2
       ORDER BY cs.calculated_at DESC
       LIMIT $3 OFFSET $4`,
      [code, req.user.userId, limit, offset],
    );
    res.json({
      data: rows.reverse(),
      total: rows[0]?.total_count ?? 0,
      limit,
      offset,
    });
  } catch (err) {
    console.error("GET /:code/comfort error:", err.message);
    return next(err);
  }
});

router.get("/:code/insights", authMiddleware, async (req, res, next) => {
  const { code } = req.params;
  const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 20), 100);
  const offset = Math.max(0, parseInt(req.query.offset) || 0);
  try {
    const { rows } = await db.query(
      `SELECT i.*, COUNT(*) OVER() AS total_count
       FROM ai_insights i
       JOIN devices d ON d.id = i.device_id
       WHERE d.device_code = $1 AND d.user_id = $2
       ORDER BY i.created_at DESC
       LIMIT $3 OFFSET $4`,
      [code, req.user.userId, limit, offset],
    );
    res.json({
      data: rows,
      total: rows[0]?.total_count ?? 0,
      limit,
      offset,
    });
  } catch (err) {
    console.error("GET /:code/insights error:", err.message);
    return next(err);
  }
});

router.patch(
  "/:code/insights/:id/acknowledge",
  authMiddleware,
  async (req, res, next) => {
    const { code, id } = req.params;
    try {
      const { rowCount } = await db.query(
        `UPDATE ai_insights i
       SET acknowledged = TRUE
       FROM devices d
       WHERE i.device_id = d.id
         AND i.id = $1
         AND d.device_code = $2
         AND d.user_id = $3`,
        [id, code, req.user.userId],
      );
      if (rowCount === 0) {
        const err = new Error("Insight not found");
        err.status = 404;
        return next(err);
      }
      res.json({ message: "Insight acknowledged" });
    } catch (err) {
      console.error(
        "PATCH /:code/insights/:id/acknowledge error:",
        err.message,
      );
      return next(err);
    }
  },
);

export default router;
