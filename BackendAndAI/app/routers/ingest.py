
from fastapi import APIRouter, HTTPException
from app.schemas import ReadingCreate
from app.crud import create_reading

router = APIRouter()

@router.post("/ingest")
async def ingest_reading(reading: ReadingCreate):
    try:
        await create_reading(reading)
        return {"status": "success"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))