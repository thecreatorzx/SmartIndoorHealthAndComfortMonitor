// All hardware interaction
// Raw reads
// Filtering
// Unit normalization
// 📌 Rule:
// No WiFi. No JSON. No HTTP.

#include "sensors.h"
#include "config.h"

// Libraries
#include <HardwareSerial.h>
#include <math.h>
#include <DHT.h>

// DHT Sensor
DHT dht(DHT_PIN, DHT_TYPE);


// Noise
float lastNoise = 0;

// Sensor storage
SensorData currentData = {0};

// Timing
unsigned long lastTempHumid = 0;
unsigned long lastCO2 = 0;
unsigned long lastNoiseAgg = 0;

// Noise buffer
int noiseBuffer[NOISE_SAMPLES];

void initSensors() {
    dht.begin();
}

void readTempHumidity() {
    if (millis() - lastTempHumid < TEMP_HUMID_INTERVAL) return;

    float t = dht.readTemperature();
    float h = dht.readHumidity();

    if (!isnan(t)) currentData.temperature = t;
    if (!isnan(h)) currentData.humidity = h;

    lastTempHumid = millis();
}

void readCO2() {
    if (millis() - lastCO2 < CO2_INTERVAL) return;

    int raw = analogRead(MQ135_PIN);           // Read analog value
    float voltage = raw * (3.3 / 4095.0);      // ESP32 12-bit ADC, 3.3V reference

    // Rough PPM estimation (calibration needed)
    float co2ppm = voltage * 1000.0;           // Scale 0-3.3V to ~0-3300ppm
    currentData.co2 = co2ppm;

    lastCO2 = millis();
}

float readNoiseLevel() {
    unsigned long start = millis();
    float sum = 0;

    for (int i = 0; i < NOISE_SAMPLES; i++) {
        int val = analogRead(MIC_PIN);
        sum += sq(val - 2048);  // center around mid-point
        delay(NOISE_SAMPLE_INTERVAL);
    }

    float rms = sqrt(sum / NOISE_SAMPLES);
    lastNoise = map(rms, 0, 1000, 30, 90); // pseudo-dB
    currentData.noise = lastNoise;

    return lastNoise;
}

SensorData getSensorData() {
    return currentData;
}
