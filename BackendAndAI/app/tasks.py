"""
Background tasks for monitoring readings and triggering alerts
"""
import asyncio
from datetime import datetime
from app.crud import (
    get_latest_reading, 
    create_alert, 
    get_active_alerts,
    update_alert_status
)
from app.schemas import Alert
import logging

logger = logging.getLogger(__name__)

# Define alert thresholds and severity
THRESHOLDS = {
    "high_co2": {
        "value": 1200,
        "severity": "warning",
        "message": "CO2 levels exceed 1200 ppm - ventilate the room"
    },
    "critical_co2": {
        "value": 2000,
        "severity": "critical",
        "message": "CO2 levels exceed 2000 ppm - immediate action required"
    },
    "high_temperature": {
        "value": 28,
        "severity": "warning",
        "message": "Temperature exceeds 28°C"
    },
    "low_temperature": {
        "value": 16,
        "severity": "warning",
        "message": "Temperature below 16°C"
    },
    "low_humidity": {
        "value": 30,
        "severity": "info",
        "message": "Humidity below 30% - air is too dry"
    },
    "high_humidity": {
        "value": 60,
        "severity": "warning",
        "message": "Humidity above 60% - risk of mold"
    },
    "high_noise": {
        "value": 65,
        "severity": "warning",
        "message": "Noise level exceeds 65 dB"
    },
}

async def monitor_readings(devices: list = None):
    """
    Monitors all devices and triggers alerts based on thresholds
    Runs as background task (typically every 1-5 minutes)
    """
    if devices is None:
        devices = ["ESP32_001", "ESP32_002", "ESP32_003"]
    
    for device_id in devices:
        try:
            reading = await get_latest_reading(device_id)
            if not reading:
                continue
            
            # Get current active alerts for this device
            active_alerts = await get_active_alerts(device_id)
            active_types = {alert["type"] for alert in active_alerts}
            
            # Check CO2 levels
            if reading["co2"] > THRESHOLDS["critical_co2"]["value"]:
                await trigger_alert(
                    device_id, 
                    "critical_co2", 
                    active_types,
                    reading["timestamp"]
                )
            elif reading["co2"] > THRESHOLDS["high_co2"]["value"]:
                await trigger_alert(
                    device_id, 
                    "high_co2", 
                    active_types,
                    reading["timestamp"]
                )
            else:
                # Resolve high_co2 alert if CO2 is now normal
                await resolve_alert_if_normal(device_id, "high_co2", active_types)
            
            # Check temperature
            if reading["temperature"] > THRESHOLDS["high_temperature"]["value"]:
                await trigger_alert(
                    device_id, 
                    "high_temperature", 
                    active_types,
                    reading["timestamp"]
                )
            elif reading["temperature"] < THRESHOLDS["low_temperature"]["value"]:
                await trigger_alert(
                    device_id, 
                    "low_temperature", 
                    active_types,
                    reading["timestamp"]
                )
            else:
                await resolve_alert_if_normal(device_id, "high_temperature", active_types)
                await resolve_alert_if_normal(device_id, "low_temperature", active_types)
            
            # Check humidity
            if reading["humidity"] < THRESHOLDS["low_humidity"]["value"]:
                await trigger_alert(
                    device_id, 
                    "low_humidity", 
                    active_types,
                    reading["timestamp"]
                )
            elif reading["humidity"] > THRESHOLDS["high_humidity"]["value"]:
                await trigger_alert(
                    device_id, 
                    "high_humidity", 
                    active_types,
                    reading["timestamp"]
                )
            else:
                await resolve_alert_if_normal(device_id, "low_humidity", active_types)
                await resolve_alert_if_normal(device_id, "high_humidity", active_types)
            
            # Check noise
            if reading["noise"] > THRESHOLDS["high_noise"]["value"]:
                await trigger_alert(
                    device_id, 
                    "high_noise", 
                    active_types,
                    reading["timestamp"]
                )
            else:
                await resolve_alert_if_normal(device_id, "high_noise", active_types)
        
        except Exception as e:
            logger.error(f"Error monitoring device {device_id}: {str(e)}", exc_info=True)

async def trigger_alert(device_id: str, alert_type: str, active_types: set, timestamp):
    """Creates alert if not already active"""
    
    # Don't create duplicate alert
    if alert_type in active_types:
        return
    
    threshold_info = THRESHOLDS.get(alert_type, {})
    
    alert = Alert(
        type=alert_type,
        severity=threshold_info.get("severity", "info"),
        message=threshold_info.get("message", "Threshold exceeded"),
        device_id=device_id,
        start_time=timestamp,
        resolved=False
    )
    
    try:
        await create_alert(alert)
        logger.info(f"Alert triggered: {alert_type} for {device_id}")
    except Exception as e:
        logger.error(f"Error creating alert: {str(e)}", exc_info=True)

async def resolve_alert_if_normal(device_id: str, alert_type: str, active_types: set):
    """Resolves alert if condition is no longer met"""
    if alert_type in active_types:
        try:
            await update_alert_status(device_id, alert_type, resolved=True)
            logger.info(f"Alert resolved: {alert_type} for {device_id}")
        except Exception as e:
            logger.error(f"Error resolving alert: {str(e)}", exc_info=True)
