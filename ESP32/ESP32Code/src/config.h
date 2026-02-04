// Pins, Wifi credentials, Sampling intervals, Constants, etc.
// 📌 Rule: If it might change → it belongs here.


#ifndef CONFIG_H
#define CONFIG_H

// Device
#define DEVICE_ID "room_001"

// Pins
#define DHT_PIN 4
#define MIC_PIN 34
#define MQ135_PIN 34

// Sensor types
#define DHT_TYPE DHT22

// Sampling intervals (ms)
#define TEMP_HUMID_INTERVAL 10000     // 10s
#define CO2_INTERVAL 2000             // 10s
#define NOISE_SAMPLE_INTERVAL 2       // 2ms per ADC sample
#define NOISE_AGG_INTERVAL 200        // 200ms aggregate
#define UPLOAD_INTERVAL 30000         // 30s

// Noise calculation
#define NOISE_SAMPLES 100

// Network
#define WIFI_SSID "your_ssid"
#define WIFI_PASS "your_password"
#define API_ENDPOINT "http://your_backend_endpoint/data"

#endif
