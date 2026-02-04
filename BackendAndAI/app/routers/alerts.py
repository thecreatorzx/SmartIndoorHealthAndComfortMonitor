from fastapi import APIRouter, Query
from app.crud import get_active_alerts

router = APIRouter()

@router.get("/alerts")
async def active_alerts(
    device_id: str = Query(..., description="ESP32 Device ID")
):
    alerts = await get_active_alerts(device_id)
    return {"active_alerts": alerts}