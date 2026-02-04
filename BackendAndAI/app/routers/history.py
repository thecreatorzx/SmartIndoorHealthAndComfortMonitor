from fastapi import APIRouter, HTTPException, Query
from datetime import datetime
from app.crud import get_history

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
        raise HTTPException(status_code=400, detail="Invalid date format. Use ISO format.")

    data = await get_history(device_id, start_dt, end_dt)
    if not data:
        return {"message": "No readings in this period."}
    return data