#pragma once
#include "sensors.h"

void network_init();
void network_loop();
bool network_connected();
void network_send(const SensorData& data);