from fastapi import APIRouter, HTTPException, Query
from app.crud import get_latest_reading

router = APIRouter()

@router.get("/latest")
async def latest_reading(device_id: str = Query(..., description="ESP32 Device ID")):
    try:
        reading = await get_latest_reading(device_id)
        if reading is None:
            raise HTTPException(status_code=404, detail="No readings found for the specified device.")
        return reading
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))