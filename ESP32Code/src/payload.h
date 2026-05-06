#pragma once
#include "sensors.h"
#include <Arduino.h>

String payload_register(const char* deviceCode);
String payload_build(const SensorData& data, const char* deviceCode);