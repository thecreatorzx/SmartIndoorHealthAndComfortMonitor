import logging
from fastapi import APIRouter, Query, HTTPException
from app.crud import get_active_alerts, create_alert, update_alert_status, get_alert_history
from app.schemas import Alert

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/alerts")
async def active_alerts(
    device_id: str = Query(..., description="ESP32 Device ID")
):
    """Get all active (unresolved) alerts for a device"""
    try:
        alerts = await get_active_alerts(device_id)
        logger.debug(f"Retrieved {len(alerts)} active alerts for device {device_id}")
        return {"active_alerts": alerts}
    except (ConnectionError, TimeoutError) as e:
        logger.error(f"Database connection error fetching active alerts for device {device_id}: {type(e).__name__}", exc_info=True)
        raise HTTPException(status_code=503, detail="Database service unavailable")
    except Exception as e:
        logger.error(f"Unexpected error fetching active alerts for device {device_id}: {type(e).__name__}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.get("/alerts/history/{device_id}")
async def alert_history(device_id: str):
    """Get alert history (all alerts - resolved and active)"""
    try:
        alerts = await get_alert_history(device_id)
        logger.debug(f"Retrieved {len(alerts)} total alerts for device {device_id}")
        return {
            "device_id": device_id,
            "total_alerts": len(alerts),
            "alerts": alerts
        }
    except (ConnectionError, TimeoutError) as e:
        logger.error(f"Database connection error fetching alert history for device {device_id}: {type(e).__name__}", exc_info=True)
        raise HTTPException(status_code=503, detail="Database service unavailable")
    except Exception as e:
        logger.error(f"Unexpected error fetching alert history for device {device_id}: {type(e).__name__}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")

@router.post("/alerts")
async def create_alert_manual(alert: Alert):
    """Manually create an alert"""
    try:
        await create_alert(alert)
        logger.info(f"Manual alert created: {alert.type} for device {alert.device_id}")
        return {"status": "alert_created", "alert": alert}
    except (ConnectionError, TimeoutError) as e:
        logger.error(f"Database connection error creating alert for device {alert.device_id}: {type(e).__name__}", exc_info=True)
        raise HTTPException(status_code=503, detail="Database service unavailable")
    except ValueError as e:
        logger.warning(f"Invalid alert data for device {alert.device_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid alert data: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error creating alert for device {alert.device_id}: {type(e).__name__}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")
