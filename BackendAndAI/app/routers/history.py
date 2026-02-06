import logging
from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from app.crud import get_history

logger = logging.getLogger(__name__)

router = APIRouter()

@router.get("/history")
async def history(
    device_id: str = Query(..., description="ESP32 Device ID"),
    start:  str = Query(..., description="Start timestamp in ISO format"),
    end: str = Query(..., description="End timestamp in ISO format")
):  
    try:
        start_dt = datetime.fromisoformat(start)
        end_dt = datetime.fromisoformat(end)
    except ValueError:
        logger.warning(f"Invalid date format for device {device_id}: start={start}, end={end}")
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format.")

    try:
        data = await get_history(device_id, start_dt, end_dt)
        if not data:
            logger.info(f"No readings found for device {device_id} between {start_dt} and {end_dt}")
            return {"message": "No readings in this period."}
        logger.debug(f"Retrieved {len(data)} readings for device {device_id}")
        return data
    except (ConnectionError, TimeoutError) as e:
        logger.error(f"Database connection error while fetching history for device {device_id}: {type(e).__name__}", exc_info=True)
        raise HTTPException(status_code=503, detail="Database service unavailable")
    except Exception as e:
        logger.error(f"Unexpected error fetching history for device {device_id}: {type(e).__name__}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")