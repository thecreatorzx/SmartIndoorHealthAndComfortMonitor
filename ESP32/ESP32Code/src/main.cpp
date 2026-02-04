// Scheduler
// Timing
// Orchestration
// 📌 Rule:
// loop() should read like a control script, not a brain.
#include <Arduino.h> // Essential for analogRead, Serial, etc.



#include "sensors.h"
#include "network.h"
#include "payload.h"
#include "config.h"

unsigned long lastUpload = 0;

void setup() {
    Serial.begin(115200);
    initWiFi();
    initSensors();
}

void loop() {
    readTempHumidity();
    readCO2();

    // Noise aggregation
    if (millis() - lastUpload % NOISE_AGG_INTERVAL < 50) {
        readNoiseLevel();
    }

    if (millis() - lastUpload > UPLOAD_INTERVAL) {
        SensorData data = getSensorData();
        String payload = createPayload(data);
        Serial.println(payload); // debug
        sendData(payload);
        lastUpload = millis();
    }
}

