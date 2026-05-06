#include <Arduino.h>
#include "config.h"
#include "sensors.h"
#include "network.h"

static unsigned long lastSensorRead = 0;

void setup() {
  Serial.begin(115200);
  delay(500);
  Serial.println("[main] Booting");

  sensors_init();
  network_init();

  Serial.println("[main] Ready");
}

void loop() {
  sensors_tick();   // fills noise buffer — must run every iteration
  network_loop();   // keeps WebSocket alive — must run every iteration

  unsigned long now = millis();
  if (now - lastSensorRead < SENSOR_READ_INTERVAL_MS) return;
  lastSensorRead = now;

  SensorData reading = sensors_read();

  if (!reading.valid) {
    Serial.println("[main] Invalid reading — skipping");
    return;
  }
  Serial.printf(
    "[main] T:%.1f H:%.1f AQ:%d Noise:%.1f Light:%.1f UV:%.2f P:%.1f\n",
    reading.temperature, reading.humidity, reading.air_quality,
    reading.noise, reading.light, reading.uv, reading.pressure
  );

  network_send(reading);
}