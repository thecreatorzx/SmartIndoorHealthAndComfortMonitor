// db.js
import { Pool } from "pg";
import "dotenv/config";

const db = new Pool({
  host: process.env.HOST,
  database: process.env.DATABASE,
  port: process.env.DB_PORT,
  user: process.env.USER,
  password: process.env.PASSWORD,
});

// ─── Table Definitions ────────────────────────────────────────────────────────

const users_table = `
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);`;

// user_id added — device ownership for multi-tenant access
const device_table = `
CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    device_code VARCHAR(50) NOT NULL,
    location VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    CONSTRAINT devices_device_code_user_unique UNIQUE (user_id, device_code),
    CONSTRAINT devices_device_code_unique UNIQUE (device_code)
);`;

const readings_table = `
CREATE TABLE IF NOT EXISTS readings (
    id BIGSERIAL PRIMARY KEY,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    temperature REAL NOT NULL,
    humidity REAL NOT NULL,
    air_quality INTEGER,
    light REAL,
    uv REAL,
    pressure REAL,
    noise REAL,
    sample_count SMALLINT DEFAULT 1,
    recorded_at TIMESTAMP NOT NULL
);`;

const readings_index = `
CREATE INDEX IF NOT EXISTS idx_readings_device_time
ON readings(device_id, recorded_at DESC);`;

// Tracks a bad condition that persisted over time (e.g. HIGH_air_quality for 45 min)
const exposure_events_table = `
CREATE TABLE IF NOT EXISTS exposure_events (
    id BIGSERIAL PRIMARY KEY,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    type VARCHAR(50) NOT NULL,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP,
    max_value REAL,
    duration_minutes INTEGER,
    severity VARCHAR(20),
    resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);`;

const exposure_events_index = `
CREATE INDEX IF NOT EXISTS idx_exposure_device_time
ON exposure_events(device_id, start_time DESC);`;

// User-facing notifications — separate from the technical exposure record
const alerts_table = `
CREATE TABLE IF NOT EXISTS alerts (
    id BIGSERIAL PRIMARY KEY,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    exposure_id BIGINT REFERENCES exposure_events(id) ON DELETE SET NULL,
    title VARCHAR(100),
    message TEXT,
    severity VARCHAR(20),
    acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);`;

// Stores computed comfort scores over time for trend analysis
const comfort_scores_table = `
CREATE TABLE IF NOT EXISTS comfort_scores (
    id BIGSERIAL PRIMARY KEY,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    score REAL NOT NULL,
    calculated_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);`;

const comfort_scores_index = `
CREATE INDEX IF NOT EXISTS idx_comfort_device_time
ON comfort_scores(device_id, calculated_at DESC);`;

// AI-generated insights — breach analysis and daily digests
// trigger_type: "breach" | "digest"
// breach insights: fired when a new threshold breach is detected
// digest insights: fired once per day per device, summarises the past 24h
const ai_insights_table = `
CREATE TABLE IF NOT EXISTS ai_insights (
    id BIGSERIAL PRIMARY KEY,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    trigger_type VARCHAR(20) NOT NULL,
    breached_fields TEXT[],
    summary TEXT NOT NULL,
    recommendation TEXT NOT NULL,
    severity VARCHAR(20),
    sensor_snapshot JSONB,
    acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT NOW()
);`;

const ai_insights_index = `
CREATE INDEX IF NOT EXISTS idx_ai_insights_device_time
ON ai_insights(device_id, created_at DESC);`;

// ─── Query Functions ───────────────────────────────────────────────────────────

export async function storeReading(deviceId, aggregate) {
  const query = `
    INSERT INTO readings
      (device_id, temperature, humidity, air_quality, light, uv, pressure, noise, sample_count, recorded_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `;
  const values = [
    deviceId,
    aggregate.temperature,
    aggregate.humidity,
    aggregate.air_quality != null ? Math.round(aggregate.air_quality) : null,
    aggregate.light ?? null,
    aggregate.uv ?? null,
    aggregate.pressure ?? null,
    aggregate.noise ?? null,
    aggregate.sample_count,
    new Date(aggregate.timestamp),
  ];
  await db.query(query, values);
}

export async function isRegisteredDevice(deviceCode) {
  const { rows } = await db.query(
    `SELECT id FROM devices WHERE device_code = $1`,
    [deviceCode],
  );
  return rows.length > 0 ? rows[0].id : null;
}

// Opens a new exposure event when a threshold is crossed
export async function openExposureEvent(deviceId, type, value, severity) {
  const { rows } = await db.query(
    `INSERT INTO exposure_events (device_id, type, start_time, max_value, severity)
     VALUES ($1, $2, NOW(), $3, $4)
     RETURNING id`,
    [deviceId, type, value, severity],
  );
  return rows[0].id;
}

// Closes an exposure event when the condition recovers
export async function closeExposureEvent(exposureId) {
  await db.query(
    `UPDATE exposure_events
     SET end_time = NOW(),
         duration_minutes = EXTRACT(EPOCH FROM (NOW() - start_time)) / 60,
         resolved = TRUE
     WHERE id = $1`,
    [exposureId],
  );
}

// Updates max_value if the condition worsens during an ongoing exposure
export async function updateExposureMax(exposureId, newValue) {
  await db.query(
    `UPDATE exposure_events
     SET max_value = GREATEST(max_value, $1)
     WHERE id = $2`,
    [newValue, exposureId],
  );
}

export async function createAlert(
  deviceId,
  exposureId,
  title,
  message,
  severity,
) {
  await db.query(
    `INSERT INTO alerts (device_id, exposure_id, title, message, severity)
     VALUES ($1, $2, $3, $4, $5)`,
    [deviceId, exposureId, title, message, severity],
  );
}

export async function storeComfortScore(deviceId, score) {
  await db.query(
    `INSERT INTO comfort_scores (device_id, score, calculated_at)
     VALUES ($1, $2, NOW())`,
    [deviceId, score],
  );
}

// ─── AI Insight Query Functions ───────────────────────────────────────────────

// Stores a breach or digest insight generated by the AI service
export async function storeAiInsight(
  deviceId,
  {
    triggerType,
    breachedFields,
    summary,
    recommendation,
    severity,
    sensorSnapshot,
  },
) {
  const { rows } = await db.query(
    `INSERT INTO ai_insights
       (device_id, trigger_type, breached_fields, summary, recommendation, severity, sensor_snapshot)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING id`,
    [
      deviceId,
      triggerType,
      breachedFields ?? null,
      summary,
      recommendation,
      severity ?? null,
      sensorSnapshot ? JSON.stringify(sensorSnapshot) : null,
    ],
  );
  return rows[0].id;
}

// Checks if a breach insight was already fired for these fields in the last N minutes
// Prevents flooding the user with identical "open a window" cards
export async function recentBreachInsightExists(
  deviceId,
  breachedFields,
  withinMinutes = 60,
) {
  const { rows } = await db.query(
    `SELECT id FROM ai_insights
     WHERE device_id = $1
       AND trigger_type = 'breach'
       AND breached_fields && $2
       AND created_at > NOW() - INTERVAL '1 minute' * $3
     LIMIT 1`,
    [deviceId, breachedFields, withinMinutes],
  );
  return rows.length > 0;
}

// Checks if a digest was already generated today for this device
export async function digestGeneratedToday(deviceId) {
  const { rows } = await db.query(
    `SELECT id FROM ai_insights
     WHERE device_id = $1
       AND trigger_type = 'digest'
       AND created_at >= NOW()::date
     LIMIT 1`,
    [deviceId],
  );
  return rows.length > 0;
}

// Fetches recent readings for digest context — last N rows for a device
export async function getRecentReadings(deviceId, limit = 50) {
  const { rows } = await db.query(
    `SELECT temperature, humidity, air_quality, light, uv, pressure, noise, recorded_at
     FROM readings
     WHERE device_id = $1
     ORDER BY recorded_at DESC
     LIMIT $2`,
    [deviceId, limit],
  );
  return rows.reverse(); // chronological order
}

export async function getAiInsights(deviceId, limit = 20) {
  const { rows } = await db.query(
    `SELECT * FROM ai_insights
     WHERE device_id = $1
     ORDER BY created_at DESC
     LIMIT $2`,
    [deviceId, limit],
  );
  return rows;
}

export async function acknowledgeInsight(insightId) {
  await db.query(`UPDATE ai_insights SET acknowledged = TRUE WHERE id = $1`, [
    insightId,
  ]);
}

// ─── Setup ────────────────────────────────────────────────────────────────────

export async function table_setup() {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);

    // Order matters — referenced tables must exist first
    await client.query(users_table);
    await client.query(device_table);
    await client.query(readings_table);
    await client.query(readings_index);
    await client.query(exposure_events_table);
    await client.query(exposure_events_index);
    await client.query(alerts_table);
    await client.query(comfort_scores_table);
    await client.query(comfort_scores_index);
    await client.query(ai_insights_table);
    await client.query(ai_insights_index);

    await client.query("COMMIT");
    console.log("Tables created successfully");
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Error setting up tables:", err);
    throw err;
  } finally {
    client.release();
  }
}

export default db;

if (process.argv[1].endsWith("db.js")) {
  (async () => {
    try {
      await table_setup();
    } catch (err) {
      console.error(err);
    } finally {
      await db.end();
    }
  })();
}
