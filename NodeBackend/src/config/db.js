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

const users_table = `
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);`;

const device_table = `
CREATE TABLE IF NOT EXISTS devices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    device_code VARCHAR(50) UNIQUE NOT NULL,
    location VARCHAR(100),
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);`;

const readings_table = `
CREATE TABLE IF NOT EXISTS readings (
    id BIGSERIAL PRIMARY KEY,
    device_id UUID REFERENCES devices(id) ON DELETE CASCADE,
    temperature REAL NOT NULL,
    humidity REAL NOT NULL,
    co2 INTEGER NOT NULL,
    light REAL,
    uv REAL,
    pressure REAL,
    noise REAL NOT NULL,
    sample_count SMALLINT DEFAULT 1,
    recorded_at TIMESTAMP NOT NULL
);`;

const readings_index = `
CREATE INDEX IF NOT EXISTS idx_readings_device_time
ON readings(device_id, recorded_at DESC);`;

export async function storeReading(deviceId, aggregate) {
  const query = `
    INSERT INTO readings
      (device_id, temperature, humidity, co2, light, uv, pressure, noise, sample_count, recorded_at)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
  `;
  const values = [
    deviceId,
    aggregate.temperature,
    aggregate.humidity,
    aggregate.co2,
    aggregate.light ?? null,
    aggregate.uv ?? null,
    aggregate.pressure ?? null,
    aggregate.noise,
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

export async function table_setup() {
  const client = await db.connect();
  try {
    await client.query("BEGIN");
    await client.query(`CREATE EXTENSION IF NOT EXISTS "pgcrypto";`);
    await client.query(device_table);
    await client.query(readings_table);
    await client.query(readings_index);
    await client.query(users_table);
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
