// WiFi connection
// Reconnection logic
// Data transmission
// 📌 Rule:
// No sensor logic here.


#include "network.h"
#include "config.h"
#include <HTTPClient.h>

void initWiFi() {
    WiFi.begin(WIFI_SSID, WIFI_PASS);
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("WiFi connected");
}

void reconnectWiFi() {
    if (WiFi.status() != WL_CONNECTED) {
        WiFi.disconnect();
        WiFi.begin(WIFI_SSID, WIFI_PASS);
        unsigned long start = millis();
        while (WiFi.status() != WL_CONNECTED && millis() - start < 10000) {
            delay(500);
            Serial.print(".");
        }
    }
}

bool sendData(const String &payload) {
    if (WiFi.status() != WL_CONNECTED) reconnectWiFi();

    HTTPClient http;
    http.begin(API_ENDPOINT);
    http.addHeader("Content-Type", "application/json");
    int code = http.POST(payload);
    http.end();

    return (code > 0 && code < 300);
}
