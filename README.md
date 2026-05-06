# ESP32 Environment Monitor — Backend

A real-time multi-tenant indoor environment monitoring system. ESP32 devices stream
sensor data over WebSockets every 2 seconds. A Node.js backend processes, stores, and
forwards readings to a dashboard frontend via Socket.IO, with automated threshold
alerting, exposure tracking, comfort scoring, and AI-generated insights powered by
Gemini 2.5 Flash.

---

## Features

- **Real-time sensor ingestion** via raw WebSocket from ESP32 devices
- **Multi-tenant** — each user owns their devices, all data is scoped per user
- **Threshold alerting** — warning and critical levels for all 7 sensor fields
- **Exposure tracking** — records how long a bad condition persists, auto-closes on recovery
- **Comfort scoring** — 0–100 score computed per reading, stored per minute
- **AI insights** — Gemini 2.5 Flash generates breach analysis and daily digests
- **Live dashboard feed** via Socket.IO with authenticated connections
- **JWT auth** via HttpOnly cookies with rate-limited login/register
- **Scheduled jobs** — alert escalation, stale exposure cleanup, daily digest generation

---

## Tech Stack

| Layer                 | Technology                      |
| --------------------- | ------------------------------- |
| Runtime               | Node.js (ESM)                   |
| HTTP / REST           | Express                         |
| WebSocket (ESP32)     | `ws` library                    |
| Real-time (dashboard) | Socket.IO                       |
| Database              | PostgreSQL                      |
| Auth                  | JWT + bcrypt + HttpOnly cookies |
| AI                    | Google Gemini 2.5 Flash         |
| Validation            | Zod                             |
| Security              | Helmet, express-rate-limit      |

---

## Project Structure

```
├── config/
│   ├── db.js               # PostgreSQL pool, table setup, all query functions
│   ├── threshold.js        # Sensor threshold definitions and breach checker
│   └── gemini.service.js   # Gemini API — breach insights and daily digests
├── middleware/
│   ├── auth.middleware.js  # JWT auth for REST (authMiddleware) and Socket.IO (authSocket)
│   ├── errorHandler.js     # Central error handler — all errors flow here via next(err)
│   └── validate.js         # Zod schemas + validate() middleware factory
├── routes/
│   ├── auth.routes.js      # /auth — register, login, me, logout
│   └── devices.route.js    # /devices — CRUD, readings, alerts, exposures, insights, stats
├── schedulers/
│   ├── alert.scheduler.js  # Runs every 60s — escalation, stale cleanup, alert-counts emit
│   └── digest.scheduler.js # Runs every 60min — daily AI digest per device
├── sockets/
│   ├── esp32.socket.js     # Raw WS server at /esp32 — registration, data ingestion
│   └── socketio.socket.js  # Socket.IO — dashboard auth, history, status events
├── state/
│   └── state.js            # In-memory Map of connected devices
└── server.js               # Entry point — Express, HTTP, Socket.IO, schedulers, shutdown
```

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+
- A Google Gemini API key ([get one here](https://aistudio.google.com/app/apikey))

---

## Getting Started

### 1. Clone and install

```bash
git clone <your-repo-url>
cd <project-folder>
npm install
```

### 2. Configure environment variables

Create a `.env` file in the project root:

```env
# Server
PORT=3000
ESP_PATH=/esp32
NODE_ENV=development
CLIENT_ORIGIN=http://localhost:5173

# Database
HOST=localhost
DB_PORT=5432
DATABASE=environment_monitor
USER=postgres
PASSWORD=yourpassword

# Auth
JWT_SECRET=your_long_random_secret_here

# AI
GEMINI_API_KEY=your_gemini_api_key_here
```

### 3. Set up the database

Create the database in PostgreSQL:

```bash
psql -U postgres -c "CREATE DATABASE environment_monitor;"
```

Then run the table setup script:

```bash
node config/db.js
```

This creates all tables and indexes inside a transaction. Safe to re-run — all
statements use `CREATE IF NOT EXISTS`.

### 4. Start the server

```bash
node server.js
```

The server will log:

```
Tables created successfully
Server running on port 3000
ESP32 → ws://localhost:3000/esp32
```

---

## ESP32 Connection

The ESP32 connects to `ws://<server-host>:3000/esp32`. Configure the host in the
device's `config.h`. The device must be pre-registered via `POST /devices` with a
matching `device_code` before it can send data — unregistered devices are rejected
at the WebSocket handshake.

**Handshake flow:**

1. ESP32 connects and sends `{ "type": "register", "deviceCode": "room_001" }`
2. Backend verifies `device_code` exists in DB, responds `{ "type": "register:ack", "success": true }`
3. ESP32 begins sending sensor data every 2 seconds

See `esp32_backend_handoff.md` for full ESP32 protocol documentation.

---

## API Overview

Full documentation for the frontend developer is in `frontend_handoff.md`. Summary:

### Auth

| Method | Path             | Description                      |
| ------ | ---------------- | -------------------------------- |
| POST   | `/auth/register` | Create account, sets auth cookie |
| POST   | `/auth/login`    | Login, sets auth cookie          |
| GET    | `/auth/me`       | Get current user                 |
| POST   | `/auth/logout`   | Clear auth cookie                |

### Devices

| Method | Path                                      | Description                                                                       |
| ------ | ----------------------------------------- | --------------------------------------------------------------------------------- |
| GET    | `/devices`                                | List all user's devices with live status                                          |
| POST   | `/devices`                                | Register a new device                                                             |
| GET    | `/devices/:code`                          | Single device detail                                                              |
| PATCH  | `/devices/:code`                          | Update location/description                                                       |
| DELETE | `/devices/:code`                          | Delete device and all data                                                        |
| GET    | `/devices/:code/stats`                    | Dashboard snapshot — latest reading, comfort score, open exposures, unread alerts |
| GET    | `/devices/:code/readings`                 | Paginated reading history                                                         |
| GET    | `/devices/:code/exposures`                | Paginated exposure event history                                                  |
| GET    | `/devices/:code/alerts`                   | Paginated alerts                                                                  |
| PATCH  | `/devices/:code/alerts/:id/acknowledge`   | Mark alert as read                                                                |
| GET    | `/devices/:code/comfort`                  | Paginated comfort score history                                                   |
| GET    | `/devices/:code/insights`                 | Paginated AI insights                                                             |
| PATCH  | `/devices/:code/insights/:id/acknowledge` | Mark insight as read                                                              |

### Health

```
GET /health  →  { "status": "ok", "uptime": 123.45 }
```

---

## Socket.IO Events

All dashboard clients connect to `http://localhost:3000` with `withCredentials: true`.

| Direction       | Event            | Description                                              |
| --------------- | ---------------- | -------------------------------------------------------- |
| Server → Client | `sensor-history` | Initial history on connect, or response to `get-history` |
| Server → Client | `esp32-status`   | Device connect/disconnect status (keyed by device code)  |
| Server → Client | `sensor-update`  | Live reading every ~2s per device                        |
| Server → Client | `alert`          | Threshold breach, device timeout, or exposure escalation |
| Server → Client | `ai-insight`     | New AI insight generated (breach or digest)              |
| Server → Client | `alert-counts`   | Unread alert counts per device, every 60s                |
| Client → Server | `get-history`    | Request fresh history snapshot                           |
| Client → Server | `get-status`     | Request fresh status snapshot                            |

---

## Sensor Thresholds

| Field       | Warning             | Critical            |
| ----------- | ------------------- | ------------------- |
| temperature | < 18 or > 30 °C     | < 10 or > 38 °C     |
| humidity    | < 30 or > 70 %      | < 20 or > 85 %      |
| air_quality | > 1000              | > 2500              |
| noise       | > 75                | > 90                |
| uv          | > 6                 | > 8                 |
| light       | > 1000 lux          | > 2000 lux          |
| pressure    | < 990 or > 1025 hPa | < 970 or > 1040 hPa |

---

## Background Jobs

| Job                 | Interval    | What it does                                                               |
| ------------------- | ----------- | -------------------------------------------------------------------------- |
| DB flush            | every 5s    | Aggregates buffered readings and persists to DB                            |
| Comfort score store | every 60s   | Persists comfort score for connected devices                               |
| Timeout monitor     | every 5s    | Emits timeout alert if device silent for 10s                               |
| Alert scheduler     | every 60s   | Escalates 30min+ warnings, closes stale exposures, broadcasts alert counts |
| Digest scheduler    | every 60min | Generates one AI daily digest per device if not yet done today             |

---

## Environment Variables Reference

| Variable         | Required | Description                                                                  |
| ---------------- | -------- | ---------------------------------------------------------------------------- |
| `PORT`           | No       | HTTP server port (default: `3000`)                                           |
| `ESP_PATH`       | No       | WebSocket path for ESP32 (default: `/esp32`)                                 |
| `NODE_ENV`       | No       | Set to `production` to enable secure cookies and suppress error stack traces |
| `CLIENT_ORIGIN`  | No       | Frontend origin for CORS (default: `http://localhost:5173`)                  |
| `HOST`           | Yes      | PostgreSQL host                                                              |
| `DB_PORT`        | Yes      | PostgreSQL port                                                              |
| `DATABASE`       | Yes      | PostgreSQL database name                                                     |
| `USER`           | Yes      | PostgreSQL user                                                              |
| `PASSWORD`       | Yes      | PostgreSQL password                                                          |
| `JWT_SECRET`     | Yes      | Secret for signing JWTs — use a long random string in production             |
| `GEMINI_API_KEY` | Yes      | Google Gemini API key                                                        |

---

## Database Schema

| Table             | Description                                          |
| ----------------- | ---------------------------------------------------- |
| `users`           | Registered accounts                                  |
| `devices`         | ESP32 devices, owned by a user                       |
| `readings`        | Aggregated sensor readings (flushed every 5s)        |
| `exposure_events` | Records of threshold breaches with duration tracking |
| `alerts`          | User-facing notifications tied to exposures          |
| `comfort_scores`  | Computed comfort scores over time                    |
| `ai_insights`     | AI-generated breach analysis and daily digests       |

---

## Security Notes

- Auth cookies are `HttpOnly`, `SameSite: None`, `Secure` in production
- All device data is scoped to the owning user — no cross-user data leakage
- Login and register are rate-limited to 20 requests per 15 minutes per IP
- Helmet sets standard HTTP security headers on all responses
- Input validated via Zod before reaching any route handler
- All errors flow through a central error handler — no stack traces exposed in production
