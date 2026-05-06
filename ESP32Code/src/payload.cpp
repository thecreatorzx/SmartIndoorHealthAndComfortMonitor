#include "payload.h"
#include <ArduinoJson.h>

String payload_register(const char* deviceCode) {
  JsonDocument doc;
  doc["type"]       = "register";
  doc["deviceCode"] = deviceCode;

  String out;
  serializeJson(doc, out);
  return out;
}

String payload_build(const SensorData& data, const char* deviceCode) {
  JsonDocument doc;
  doc["type"]         = "data";
  doc["deviceCode"]   = deviceCode;
  doc["temperature"]  = roundf(data.temperature * 10) / 10.0f;
  doc["humidity"]     = roundf(data.humidity * 10) / 10.0f;
  doc["sample_count"] = data.sample_count;
  if (data.air_quality >= 0) doc["air_quality"] = data.air_quality; 
  if (data.noise >= 0)    doc["noise"]    = roundf(data.noise * 10) / 10.0f;
  if (data.light >= 0)    doc["light"]    = roundf(data.light * 10) / 10.0f;
  if (data.uv >= 0)       doc["uv"]       = roundf(data.uv * 100) / 100.0f;
  if (data.pressure > 0)  doc["pressure"] = roundf(data.pressure * 10) / 10.0f;

  String out;
  serializeJson(doc, out);
  return out;
}