from fastapi import APIRouter, Query, HTTPException
from app.crud import get_active_alerts, create_alert, update_alert_status, get_alert_history
from app.schemas import Alert

router = APIRouter()

@router.get("/alerts")
async def active_alerts(
    device_id: str = Query(..., description="ESP32 Device ID")
):
    """Get all active (unresolved) alerts for a device"""
    alerts = await get_active_alerts(device_id)
    return {"active_alerts": alerts}

@router.get("/alerts/history/{device_id}")
async def alert_history(device_id: str):
    """Get alert history (all alerts - resolved and active)"""
    alerts = await get_alert_history(device_id)
    return {
        "device_id": device_id,
        "total_alerts": len(alerts),
        "alerts": alerts
    }

@router.post("/alerts")
async def create_alert_manual(alert: Alert):
    """Manually create an alert"""
    try:
        await create_alert(alert)
        return {"status": "alert_created", "alert": alert}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
