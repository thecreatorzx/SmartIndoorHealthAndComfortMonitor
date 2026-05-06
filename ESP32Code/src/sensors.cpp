#include "sensors.h"
#include "config.h"
#include <Adafruit_AHTX0.h>
#include <Adafruit_BMP085.h>
#include <Wire.h>
#include <Arduino.h>

static Adafruit_AHTX0   aht;
static Adafruit_BMP085  bmp;
static bool ahtAvailable   = false;
static bool bmpAvailable   = false;
static bool lightAvailable = true;
static bool uvAvailable    = true;

// ─── Noise Buffer ──────────────────────────────────────────────────────────
static int   noiseBuffer[NOISE_SAMPLES] = {0};
static int   noiseIndex                 = 0;
static bool   noiseReady                = false;
static unsigned long lastNoiseTick      = 0;

// ─── Air Quality internal EMA ──────────────────────────────────────────────
static float airQualityFiltered    = 0;
static bool  airQualityInitialized = false;

// ─── Init ──────────────────────────────────────────────────────────────────

void sensors_init() {
  Wire.begin();  // SDA=21, SCL=22 by default on ESP32

  ahtAvailable = aht.begin();
  if (!ahtAvailable) {
    Serial.println("[sensors] AHT21 not found");
  }

  bmpAvailable = bmp.begin();
  if (!bmpAvailable) {
    Serial.println("[sensors] BMP180 not found — pressure skipped");
  }

  lightAvailable = SENSOR_LIGHT_PRESENT;
  uvAvailable    = SENSOR_UV_PRESENT;

  if (!lightAvailable) Serial.println("[sensors] Light sensor disabled");
  if (!uvAvailable)    Serial.println("[sensors] UV sensor disabled");

  Serial.println("[sensors] Initialized");
  Serial.println("[sensors] WARNING: MQ135 requires 24-48h preheat for accurate readings");
}

// ─── Noise Tick ────────────────────────────────────────────────────────────
// Called every loop() — fills rolling buffer continuously
// This is what makes peak-to-peak meaningful

void sensors_tick() {
  unsigned long now = millis();
  if (now - lastNoiseTick < NOISE_SAMPLE_RATE_MS) return;
  lastNoiseTick = now;

  noiseBuffer[noiseIndex] = analogRead(PIN_MIC);
  noiseIndex = (noiseIndex + 1) % NOISE_SAMPLES;

  if(!noiseReady && noiseIndex == 0) {
    noiseReady = true;
    Serial.println("[sensors] Noise buffer filled — starting reads");
  }
}

// ─── Private Readers ───────────────────────────────────────────────────────

static float readNoise() {
  int minVal = 4095;
  int maxVal = 0;

  for (int i = 0; i < NOISE_SAMPLES; i++) {
    if (noiseBuffer[i] < minVal) minVal = noiseBuffer[i];
    if (noiseBuffer[i] > maxVal) maxVal = noiseBuffer[i];
  }

  int peakToPeak = maxVal - minVal;
  // Map to approximate dB-like range (30=quiet, 100=loud)
  // Tune these bounds against a reference meter for your environment
  return (float)map(peakToPeak, 0, 4095, 30, 100);
}

static float readLight() {
  long sum = 0;
  for (int i = 0; i < LIGHT_AVG_SAMPLES; i++) {
    sum += analogRead(PIN_LIGHT);
    delayMicroseconds(LIGHT_SAMPLE_DELAY_US);
  }
  float raw     = sum / (float)LIGHT_AVG_SAMPLES;
  float voltage = raw * (3.3f / 4095.0f);
  return voltage * 100.0f;
}

static float readUV() {
  // 3-sample average — UV signal is slow and clean, just removes ADC jitter
  long sum = 0;
  for (int i = 0; i < 3; i++) {
    sum += analogRead(PIN_UV);
    delayMicroseconds(200);
  }
  float voltage = (sum / 3.0f) * (3.3f / 4095.0f);
  return voltage / 0.1f;  // GUVA-S12SD: 100mV per UV index unit
}

static int readAirQuality() {
  int raw = analogRead(PIN_AIR_QUALITY);

  // Internal per-read smoothing (removes ADC spike noise)
  if (!airQualityInitialized) {
    airQualityFiltered   = (float)raw;
    airQualityInitialized = true;
  } else {
    airQualityFiltered = AIR_QUALITY_ALPHA * raw + (1.0f - AIR_QUALITY_ALPHA) * airQualityFiltered;
  }

  // MQ135 raw ADC → ppm approximation
  // This is a linear map — for real accuracy you need the Steinhart calibration
  // curve with known reference gas. For a comfort monitor this is acceptable.
  return (int)map((long)airQualityFiltered, 0, 4095, 400, 5000);
}

// ─── Main Read ─────────────────────────────────────────────────────────────

SensorData sensors_read() {
  SensorData data = {};
  data.light    = -1.0f;
  data.uv       = -1.0f;
  data.pressure = -1.0f;
  data.noise    = -1.0f;
  data.valid = true;

  // AHT21 — I2C, returns sensor_t events
  if (ahtAvailable) {
    sensors_event_t humidity_event, temp_event;
    aht.getEvent(&humidity_event, &temp_event);
    data.temperature = temp_event.temperature;
    data.humidity    = humidity_event.relative_humidity;

    if (isnan(data.temperature) || isnan(data.humidity)) {
      Serial.println("[sensors] AHT21 read failed");
      data.valid = false;
      return data;
    }
  } else {
    // No temp/humidity sensor — cannot produce a valid reading
    data.valid = false;
    return data;
  }

  data.pressure = bmpAvailable ? (bmp.readPressure() / 100.0f) : -1.0f;
  data.light = lightAvailable ? readLight() : -1.0f;
  data.uv    = uvAvailable    ? readUV()    : -1.0f;
  if (millis() < 60000) {
    data.air_quality = -1;
  } else {
    data.air_quality = readAirQuality();
  } 
  data.noise    = noiseReady ? readNoise() : -1.0f;
  data.sample_count = 1;

  return data;
}