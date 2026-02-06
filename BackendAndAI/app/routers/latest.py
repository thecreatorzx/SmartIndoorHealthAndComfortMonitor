import logging
from fastapi import APIRouter, HTTPException, Query
from app.crud import get_latest_reading

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/latest")
async def latest_reading(device_id: str = Query(..., description="ESP32 Device ID")):
    try:
        reading = await get_latest_reading(device_id)
        if reading is None:
            logger.warning(f"No readings found for device {device_id}")
            raise HTTPException(status_code=404, detail="No readings found for the specified device.")
        logger.debug(f"Retrieved latest reading for device {device_id}")
        return reading
    except HTTPException:
        raise
    except (ConnectionError, TimeoutError) as e:
        logger.error(f"Database connection error for device {device_id}: {type(e).__name__}", exc_info=True)
        raise HTTPException(status_code=503, detail="Database service unavailable")
    except Exception as e:
        logger.error(f"Unexpected error fetching latest reading for device {device_id}: {type(e).__name__}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")