#include "network.h"
#include "config.h"
#include "payload.h"
#include <WiFi.h>
#include <WebSocketsClient.h>
#include <Arduino.h>

static WebSocketsClient ws;
static bool wsRegistered = false;
static bool wsConnected  = false;

// ─── WebSocket Events ──────────────────────────────────────────────────────

static void onWsEvent(WStype_t type, uint8_t* payload, size_t length) {

  switch (type) {

    case WStype_CONNECTED: {
      wsConnected = true;
      Serial.println("[ws] Connected — sending register");

      String regMsg = payload_register(DEVICE_CODE);
      ws.sendTXT(regMsg);

      break;
    }

    case WStype_DISCONNECTED: {
      wsConnected  = false;
      wsRegistered = false;
      Serial.println("[ws] Disconnected");
      break;
    }

    case WStype_TEXT: {
      String msg = String((char*)payload);
      Serial.println("[ws] Received: " + msg);

      if (msg.indexOf("\"type\":\"register:ack\"") >= 0) {
        if (msg.indexOf("\"success\":true") >= 0) {
          wsRegistered = true;
          Serial.println("[ws] Registered successfully");
        } else {
          Serial.println("[ws] Registration rejected - reconnecting");
          ws.disconnect();
        }
      }
      break;
    }

    case WStype_ERROR: {
      Serial.printf("[ws] Error: %s\n", payload ? (char*)payload : "unknown");
      break;
    }

    default: {
      break;
    }
  }
}

// ─── WiFi ──────────────────────────────────────────────────────────────────

static unsigned long lastWifiAttempt = 0;
static unsigned long wifiRetryDelay = WIFI_RETRY_BASE_MS;

static void wifi_connect() {
  if (WiFi.status() == WL_CONNECTED) {
    wifiRetryDelay = WIFI_RETRY_BASE_MS;  // reset backoff on success
    return;
  }

  if (millis() - lastWifiAttempt < wifiRetryDelay) return;

  lastWifiAttempt = millis();
  wifiRetryDelay  = min(wifiRetryDelay * 2, (unsigned long)WIFI_RETRY_MAX_MS);

  Serial.printf("[wifi] reconnect attempt (next retry in %lums)\n", wifiRetryDelay);
  WiFi.disconnect();
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
}

// ─── Public ────────────────────────────────────────────────────────────────

void network_init() {
  wifi_connect();

  // Wait up to 10s for WiFi before starting WebSocket
  unsigned long deadline = millis() + 10000;
  while (WiFi.status() != WL_CONNECTED && millis() < deadline) {
    delay(250);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("[wifi] Connected: " + WiFi.localIP().toString());
  } else {
    Serial.println("[wifi] Not connected after 10s — WS will retry");
  }

  ws.begin(WS_HOST, WS_PORT, WS_PATH);
  ws.onEvent(onWsEvent);
  ws.enableHeartbeat(15000, 3000, 2);
  ws.setReconnectInterval(WIFI_RETRY_BASE_MS);
  Serial.println("[network] WebSocket initialized");
}

void network_loop() {
  if (WiFi.status() != WL_CONNECTED) {
    wifi_connect();
    return; 
  }
  ws.loop();
}

bool network_connected() {
  return wsConnected && wsRegistered;
}

void network_send(const SensorData& data) {
  if (!network_connected()) {
    Serial.println("[network] Not ready — skipping send");
    return;
  }
  String json = payload_build(data, DEVICE_CODE);
  Serial.println("[network] Sending: " + json);
  ws.sendTXT(json);
}