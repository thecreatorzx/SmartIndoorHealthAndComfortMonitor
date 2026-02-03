// Scheduler
// Timing
// Orchestration
// 📌 Rule:
// loop() should read like a control script, not a brain.
#include <Arduino.h> // Essential for analogRead, Serial, etc.


#include <Arduino.h>

void setup() {
  Serial.begin(115200);   // Must match JSON baudrate
  delay(1000);            // Wait for terminal to initialize
}

void loop() {
  int potValue = analogRead(34);               // Read potentiometer
  float voltage = potValue * (3.3 / 4095.0);   // Convert 12-bit ADC to voltage
  Serial.print("Raw: ");
  Serial.print(potValue);
  Serial.print("\tVoltage: ");
  Serial.println(voltage, 2);
  delay(500);                                   // 0.5s update
}
