// JSON schema
// Field naming
// Formatting consistency
// 📌 Rule:
// Backend should never guess what a field means.

#ifndef PAYLOAD_H
#define PAYLOAD_H

#include <ArduinoJson.h>
#include "sensors.h"

String createPayload(const SensorData &data);

#endif
