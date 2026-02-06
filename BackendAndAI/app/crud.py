import logging
from sqlalchemy import select 
from .models import readings_table, alerts_table
from .database import database
from .schemas import ReadingCreate, Alert

logger = logging.getLogger(__name__)

async def create_reading(reading_data: dict):
    try:
        query = readings_table.insert().values(**reading_data)
        await database.execute(query)
        logger.debug(f"Reading created for device {reading_data.get('device_id')} at {reading_data.get('timestamp')}")
    except Exception as e:
        logger.error(f"Error creating reading: {str(e)}", exc_info=True)
        raise


async def get_latest_reading(device_id: str):
    try:
        query = select(readings_table).where(readings_table.c.device_id == device_id).order_by(readings_table.c.timestamp.desc()).limit(1)
        result = await database.fetch_one(query)
        logger.debug(f"Retrieved latest reading for device {device_id}")
        return result
    except Exception as e:
        logger.error(f"Error fetching latest reading for device {device_id}: {str(e)}", exc_info=True)
        raise

async def get_history(device_id: str, start, end):
    try:
        query = select(readings_table).where(
            (readings_table.c.device_id == device_id) &
            (readings_table.c.timestamp >= start) &
            (readings_table.c.timestamp <= end)
        ).order_by(readings_table.c.timestamp.desc())
        result = await database.fetch_all(query)
        logger.debug(f"Retrieved {len(result)} readings for device {device_id} between {start} and {end}")
        return result
    except Exception as e:
        logger.error(f"Error fetching history for device {device_id}: {str(e)}", exc_info=True)
        raise
    
async def create_alert(alert_data: Alert):
    try:
        query = alerts_table.insert().values(**alert_data.dict())
        await database.execute(query)
        logger.info(f"Alert created: {alert_data.type} for device {alert_data.device_id} with severity {alert_data.severity}")
    except Exception as e:
        logger.error(f"Error creating alert: {str(e)}", exc_info=True)
        raise

async def get_active_alerts(device_id: str):
    try:
        query = select(alerts_table).where(
            (alerts_table.c.device_id == device_id) &
            (alerts_table.c.resolved == False)
        )
        result = await database.fetch_all(query)
        logger.debug(f"Retrieved {len(result)} active alerts for device {device_id}")
        return result
    except Exception as e:
        logger.error(f"Error fetching active alerts for device {device_id}: {str(e)}", exc_info=True)
        raise

async def update_alert_status(device_id: str, alert_type: str, resolved: bool):
    """Update alert status by device_id and type"""
    try:
        query = alerts_table.update().where(
            (alerts_table.c.device_id == device_id) &
            (alerts_table.c.type == alert_type) &
            (alerts_table.c.resolved == (not resolved))
        ).values(resolved=resolved)
        await database.execute(query)
        logger.info(f"Alert status updated: {alert_type} for device {device_id} - resolved={resolved}")
    except Exception as e:
        logger.error(f"Error updating alert status: {str(e)}", exc_info=True)
        raise

async def get_alert_history(device_id: str):
    """Get all alerts (resolved and active) for a device"""
    try:
        query = select(alerts_table).where(
            alerts_table.c.device_id == device_id
        ).order_by(alerts_table.c.start_time.desc())
        result = await database.fetch_all(query)
        logger.debug(f"Retrieved {len(result)} alert records for device {device_id}")
        return result
    except Exception as e:
        logger.error(f"Error fetching alert history for device {device_id}: {str(e)}", exc_info=True)
        raise

async def get_all_devices():
    """Get all unique device IDs from readings table"""
    try:
        query = select(readings_table.c.device_id).distinct()
        result = await database.fetch_all(query)
        device_ids = [row['device_id'] for row in result]
        logger.debug(f"Retrieved {len(device_ids)} unique devices")
        return device_ids
    except Exception as e:
        logger.error(f"Error fetching device list: {str(e)}", exc_info=True)
        return []