#include "payload.h"
#include "config.h"

String createPayload(const SensorData &data) {
    StaticJsonDocument<256> doc;
    doc["device_id"] = DEVICE_ID;
    doc["temperature"] = data.temperature;
    doc["humidity"] = data.humidity;
    doc["co2"] = data.co2;
    doc["noise"] = data.noise;
    doc["timestamp"] = millis() / 1000;  // simple epoch substitute

    String output;
    serializeJson(doc, output);
    return output;
}
