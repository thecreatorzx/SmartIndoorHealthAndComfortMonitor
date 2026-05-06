#pragma once

struct SensorData {
  float temperature;
  float humidity;
  int   air_quality; 
  float light;
  float uv;
  float pressure;
  float noise;
  int   sample_count;
  bool  valid;
};

void  sensors_init();
void  sensors_tick();     
SensorData sensors_read();