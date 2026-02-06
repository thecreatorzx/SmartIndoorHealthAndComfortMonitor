import logging
from fastapi import APIRouter, HTTPException
from app.schemas import ReadingCreate
from app.crud import create_reading

logger = logging.getLogger(__name__)

router = APIRouter()

@router.post("/ingest")
async def ingest_reading(reading: ReadingCreate):
    try:
        await create_reading(reading.dict())
        logger.info(f"Reading ingested successfully for device {reading.device_id}")
        return {"status": "success"}
    except (ConnectionError, TimeoutError) as e:
        logger.error(f"Database connection error while ingesting reading for device {reading.device_id}: {type(e).__name__}", exc_info=True)
        raise HTTPException(status_code=503, detail="Database service unavailable")
    except ValueError as e:
        logger.warning(f"Invalid reading data for device {reading.device_id}: {str(e)}")
        raise HTTPException(status_code=400, detail=f"Invalid data: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error ingesting reading for device {reading.device_id}: {type(e).__name__}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail="Internal server error")