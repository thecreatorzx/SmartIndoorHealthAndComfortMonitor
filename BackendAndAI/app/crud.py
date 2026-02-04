
from sqlalchemy import select 
from .models import readings_table, alerts_table
from .database import database
from .schemas import ReadingCreate, Alert

async def create_reading(reading_data: dict):
    query = readings_table.insert().values(**reading.dict())
    await database.execute(query)


async def get_latest_reading():
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
    query = (
        select(alerts_table).where(
            (alerts_table.c.device_id == device_id) &
            (alerts_table.c.resolved == False)
        )
    )
    return await database.fetch_all(query)

async def get_active_alerts(device_id: str):
    query = select(alerts_table).where(
        (alerts_table.c.device_id == device_id) &
        (alerts_table.c.resolved == False)
    )
    return await database.fetch_all(query)