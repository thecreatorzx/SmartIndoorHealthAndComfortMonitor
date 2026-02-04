from fastapi import APIRouter, HTTPException, Query
from app.crud import get_latest_reading
from datetime import datetime

router = APIRouter()

# Example comfort logic
def calculate_comfort(reading):
    # Each subscore 0-100
    temp_score = max(0, 100 - abs(reading["temperature"] - 24) * 5)
    humidity_score = max(0, 100 - abs(reading["humidity"] - 45) * 2)
    co2_score = max(0, 100 - max(0, reading["co2"] - 800) * 0.1)
    noise_score = max(0, 100 - max(0, reading["noise"] - 40) * 1)
    
    comfort_score = (
        temp_score * 0.3 +
        humidity_score * 0.25 +
        co2_score * 0.3 +
        noise_score * 0.15
    )
    
    # Actionable advice
    advice = []
    if reading["co2"] > 1200:
        advice.append("Air quality is degrading — ventilate the room.")
    if reading["humidity"] < 30:
        advice.append("Air is too dry — consider using a humidifier.")
    if reading["noise"] > 65:
        advice.append("Noise level high — reduce distractions or wear ear protection.")
    
    return {"comfort_score": round(comfort_score, 2), "advice": advice}

@router.get("/insights")
async def insights(device_id: str = Query(..., description="ESP32 device ID")):
    reading = await get_latest_reading(device_id)
    if not reading:
        raise HTTPException(status_code=404, detail="No readings found")
    result = calculate_comfort(reading)
    result["timestamp"] = reading["timestamp"]
    return result
