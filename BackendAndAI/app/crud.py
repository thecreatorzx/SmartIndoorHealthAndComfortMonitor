
from sqlalchemy import select 
from .models import readings_table, alerts_table
from .database import database
from .schemas import ReadingCreate, Alert

async def create_reading(reading_data: dict):
    query = readings_table.insert().values(**reading_data)
    await database.execute(query)


async def get_latest_reading(device_id: str):
    query = select(readings_table).where(readings_table.c.device_id == device_id).order_by(readings_table.c.timestamp.desc()).limit(1)
    return await database.fetch_one(query)

async def get_history(device_id: str, start, end):
    query = select(readings_table).where(
        (readings_table.c.device_id == device_id) &
        (readings_table.c.timestamp >= start) &
        (readings_table.c.timestamp <= end)
    ).order_by(readings_table.c.timestamp.desc())
    return await database.fetch_all(query)
    
async def create_alert(alert_data: Alert):
    query = alerts_table.insert().values(**alert_data.dict())
    await database.execute(query)

async def get_active_alerts(device_id: str):
    query = select(alerts_table).where(
        (alerts_table.c.device_id == device_id) &
        (alerts_table.c.resolved == False)
    )
    return await database.fetch_all(query)

async def update_alert_status(device_id: str, alert_type: str, resolved: bool):
    """Update alert status by device_id and type"""
    query = alerts_table.update().where(
        (alerts_table.c.device_id == device_id) &
        (alerts_table.c.type == alert_type) &
        (alerts_table.c.resolved == (not resolved))
    ).values(resolved=resolved)
    await database.execute(query)

async def get_alert_history(device_id: str):
    """Get all alerts (resolved and active) for a device"""
    query = select(alerts_table).where(
        alerts_table.c.device_id == device_id
    ).order_by(alerts_table.c.start_time.desc())
    return await database.fetch_all(query)