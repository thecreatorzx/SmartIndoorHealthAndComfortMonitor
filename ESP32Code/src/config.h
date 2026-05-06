#pragma once

// ─── WiFi ──────────────────────────────────────────────────────────
#define WIFI_SSID              "your_wifi_ssid"
#define WIFI_PASSWORD          "your_wifi_password"

// ─── Backend ───────────────────────────────────────────────────────
#define WS_HOST                "192.168.1.100"
#define WS_PORT                3000
#define WS_PATH                "/esp32"

// ─── Device ────────────────────────────────────────────────────────
#define DEVICE_CODE            "room_001"

// ─── Pins ──────────────────────────────────────────────────────────
#define PIN_MIC                34   // MAX4466   — analog
#define PIN_LIGHT              35   // TEMT6000  — analog
#define PIN_UV                 32   // GUVA-S12SD — analog
#define PIN_AIR_QUALITY        33   // MQ135     — analog
// AHT21 + BMP180 share I2C: SDA=21, SCL=22 (ESP32 default)

// ─── Noise Sampling ────────────────────────────────────────────────
#define NOISE_SAMPLES          64
#define NOISE_SAMPLE_RATE_MS   3    // ~64 samples per ~200ms window

// ─── Light ─────────────────────────────────────────────────────────
#define LIGHT_AVG_SAMPLES       20
#define LIGHT_SAMPLE_DELAY_US   1000

// ─── Air Quality EMA ───────────────────────────────────────────────
#define AIR_QUALITY_ALPHA      0.2f

// ─── Intervals ─────────────────────────────────────────────────────
#define SENSOR_READ_INTERVAL_MS   2000
#define WIFI_RETRY_BASE_MS        2000
#define WIFI_RETRY_MAX_MS         30000

// ─── Optional Sensors ──────────────────────────────────────────────
#define SENSOR_LIGHT_PRESENT   true
#define SENSOR_UV_PRESENT      true