// Scheduler
// Timing
// Orchestration
// 📌 Rule:
// loop() should read like a control script, not a brain.
#include <Arduino.h> // Essential for analogRead, Serial, etc.

// Function prototype (Declare it before use!)
void logSensorData(int value);

const int potPin = 34; // Use an ADC1 pin (like 34) for reliability

void setup() {
    Serial.begin(115200);
    delay(1000); 
    Serial.println("ESP32 Analog Read Started");
}

void loop() {
    // Read analog value (0 - 4095 on ESP32)
    int sensorValue = analogRead(potPin); 
    
    // Call our custom function
    logSensorData(sensorValue);
    
    delay(500);
}

// Function implementation
void logSensorData(int value) {
    Serial.print("Sensor Value: ");
    Serial.println(value);
}
