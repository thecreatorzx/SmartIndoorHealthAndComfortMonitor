"""
ALERT SYSTEM - TESTING GUIDE

The alert system now includes:
1. Automatic monitoring every 60 seconds
2. Threshold-based alert creation
3. Alert resolution when conditions normalize
4. Alert history tracking
5. Manual alert creation
"""

# ============================================
# THUNDER CLIENT TEST COLLECTION
# ============================================

# TEST 1: INGEST DATA THAT TRIGGERS ALERTS
POST /api/ingest
Headers: Content-Type: application/json
Body:
{
  "device_id": "ESP32_001",
  "temperature": 30,        # Above 28°C threshold
  "humidity": 25,           # Below 30% threshold
  "co2": 1500,              # Above 1200 ppm threshold
  "noise": 70,              # Above 65 dB threshold
  "timestamp": "2026-02-05T14:30:00"
}

Expected: {"status": "success"}

Note: Wait 60 seconds for background monitoring to detect violations


# TEST 2: CHECK ACTIVE ALERTS
GET /api/alerts?device_id=ESP32_001

Expected Response (after 60 seconds):
{
  "active_alerts": [
    {
      "id": 1,
      "type": "high_temperature",
      "severity": "warning",
      "message": "Temperature exceeds 28°C",
      "device_id": "ESP32_001",
      "start_time": "2026-02-05T14:30:00",
      "resolved": false
    },
    {
      "id": 2,
      "type": "low_humidity",
      "severity": "info",
      "message": "Humidity below 30% - air is too dry",
      "device_id": "ESP32_001",
      "start_time": "2026-02-05T14:30:00",
      "resolved": false
    },
    {
      "id": 3,
      "type": "high_co2",
      "severity": "warning",
      "message": "CO2 levels exceed 1200 ppm - ventilate the room",
      "device_id": "ESP32_001",
      "start_time": "2026-02-05T14:30:00",
      "resolved": false
    },
    {
      "id": 4,
      "type": "high_noise",
      "severity": "warning",
      "message": "Noise level exceeds 65 dB",
      "device_id": "ESP32_001",
      "start_time": "2026-02-05T14:30:00",
      "resolved": false
    }
  ]
}


# TEST 3: VIEW ALERT HISTORY
GET /api/alerts/history/ESP32_001

Expected Response:
{
  "device_id": "ESP32_001",
  "total_alerts": 4,
  "alerts": [
    ... all alerts (resolved and active) ...
  ]
}


# TEST 4: MANUALLY CREATE ALERT
POST /api/alerts
Headers: Content-Type: application/json
Body:
{
  "type": "critical_co2",
  "severity": "critical",
  "message": "CO2 level critical - immediate action required",
  "device_id": "ESP32_001",
  "start_time": "2026-02-05T15:00:00",
  "resolved": false
}

Expected: {"status": "alert_created", "alert": {...}}


# TEST 5: INGEST NORMAL DATA TO RESOLVE ALERTS
POST /api/ingest
Headers: Content-Type: application/json
Body:
{
  "device_id": "ESP32_001",
  "temperature": 24,        # Normal (between 16-28°C)
  "humidity": 45,           # Normal (above 30%)
  "co2": 800,               # Normal (below 1200)
  "noise": 40,              # Normal (below 65)
  "timestamp": "2026-02-05T15:01:00"
}

Expected: {"status": "success"}

Note: Wait 60 seconds for monitoring to detect conditions normalized


# TEST 6: CHECK RESOLVED ALERTS
GET /api/alerts?device_id=ESP32_001

Expected: Empty or minimal alerts
{
  "active_alerts": []
}

But in history they should show as resolved=true:
GET /api/alerts/history/ESP32_001


# ============================================
# ALERT THRESHOLDS (app/tasks.py)
# ============================================

Critical Thresholds:
├─ CO2
│  ├─ > 2000 ppm = CRITICAL (immediate action)
│  └─ > 1200 ppm = WARNING (ventilate)
├─ Temperature
│  ├─ > 28°C = WARNING (too hot)
│  └─ < 16°C = WARNING (too cold)
├─ Humidity
│  ├─ < 30% = INFO (too dry)
│  └─ > 60% = WARNING (mold risk)
└─ Noise
   └─ > 65 dB = WARNING (loud)


# ============================================
# ALERT LIFECYCLE
# ============================================

1. READING INGESTED
   POST /api/ingest with problematic values

2. STORED IN DATABASE
   readings table receives the data

3. BACKGROUND MONITORING RUNS (every 60 sec)
   monitor_readings() checks all devices
   Compares reading values to thresholds

4. ALERT CREATED (if threshold exceeded)
   create_alert() stores in alerts table
   Only creates if not already active

5. ALERT RETRIEVED
   GET /api/alerts shows active alerts

6. ALERT RESOLVED (when condition normalizes)
   update_alert_status() marks as resolved=true
   Shown in history, not in active list

7. HISTORY TRACKED
   GET /api/alerts/history shows all (old and new)


# ============================================
# IMPORTANT NOTES
# ============================================

✅ Alerts auto-create after 60 seconds
✅ Alerts auto-resolve when conditions improve
✅ Each device is monitored independently
✅ Duplicate alerts are not created
✅ Full alert history is maintained
✅ Alerts survive server restarts (in database)

⏱️ Default monitoring interval: 60 seconds
   (Can be changed in main.py: await asyncio.sleep(60))

🔧 To modify thresholds: Edit app/tasks.py THRESHOLDS dict
🔔 To add notifications: Extend trigger_alert() function
📊 To add rules: Extend monitor_readings() function
