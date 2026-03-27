import { Router } from "express";
import { state } from "../state/state.js";
import db from "../config/db.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const { rows } = await db.query(
      "SELECT id, device_code, location, description, created_at FROM devices ORDER BY created_at DESC",
    );

    const devices = rows.map((d) => ({
      ...d,
      connected: state.devices.has(d.device_code),
      lastSeen: state.devices.get(d.device_code)?.lastSeen ?? null,
    }));

    res.json(devices);
  } catch (err) {
    console.error("GET /devices error: ", err.message);
    res.status(500).json({
      error: "Failed to fetch devices",
    });
  }
});

router.post("/", async (req, res) => {
  const { device_code, location, description } = req.body;
  if (!device_code) {
    return res.status(400).json({ error: "device_code is required" });
  }
  try {
    const { rows } = await db.query(
      "INSERT INTO devices (device_code, location, description) VALUES ($1, $2, $3) RETURNING id, device_code, location, description, created_at",
      [device_code, location ?? null, description ?? null],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === "23505") {
      return res.status(409).json({ error: "device_code already exists" });
    }
    console.log("POST /devices error: ", err.message);
    res.status(500).json({ error: "Failed to create device" });
  }
});

router.get("/:code", async (req, res) => {
  const { code } = req.params;
  try {
    const { rows } = await db.query(
      "SELECT id, device_code, location, description, created_at FROM devices WHERE device_code = $1",
      [code],
    );
    if (rows.length === 0) {
      return res.status(404).json({ error: "Device not found" });
    }
    const device = rows[0];
    res.json({
      ...device,
      connected: state.devices.has(code),
      lastSeen: state.devices.get(code)?.lastSeen ?? null,
    });
  } catch (err) {
    console.error("GET /:code error:", err.message);
    res.status(500).json({ error: "Failed to fetch device" });
  }
});

router.get("/:code/readings", async (req, res) => {
  const { code } = req.params;
  const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 20), 500);
  const offset = Math.max(0, parseInt(req.query.offset) || 0);

  try {
    const { rows } = await db.query(
      `SELECT r.*
       FROM readings r
       JOIN devices d ON d.id = r.device_id
       WHERE d.device_code = $1
       ORDER BY r.recorded_at DESC
       LIMIT $2 OFFSET $3`,
      [code, limit, offset],
    );

    res.json(rows.reverse());
  } catch (err) {
    console.error("GET /devices/:code/readings error:", err.message);
    res.status(500).json({ error: "Failed to fetch readings" });
  }
});

router.delete("/:code", async (req, res) => {
  const { code } = req.params;

  try {
    const { rowCount } = await db.query(
      `DELETE FROM devices WHERE device_code = $1`,
      [code],
    );

    if (rowCount === 0) {
      return res.status(404).json({ error: "Device not found" });
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
    res.status(500).json({ error: "Failed to delete device" });
  }
});

export default router;
