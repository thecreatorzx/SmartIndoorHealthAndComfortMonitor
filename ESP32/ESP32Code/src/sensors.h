// All hardware interaction
// Raw reads
// Filtering
// Unit normalization
// 📌 Rule:
// No WiFi. No JSON. No HTTP.

#ifndef SENSORS_H
#define SENSORS_H

#include <Arduino.h>
#include <DHT.h>

struct SensorData {
    float temperature;
    float humidity;
    float co2;
    float noise;
};

// Initialize sensors
void initSensors();

// Read sensors (non-blocking where possible)
void readTempHumidity();
void readCO2();
float readNoiseLevel();

// Get latest snapshot
SensorData getSensorData();

#endif
