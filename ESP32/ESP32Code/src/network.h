// WiFi connection
// Reconnection logic
// Data transmission
// 📌 Rule:
// No sensor logic here.

#ifndef NETWORK_H
#define NETWORK_H

#include <Arduino.h>
#include <WiFi.h>

void initWiFi();
void reconnectWiFi();
bool sendData(const String &payload);

#endif
