from pydantic import BaseModel, Field
from datetime import datetime

class ReadingCreate(BaseModel):
    device_id: str
    temperature: float = Field(ge=-50, le=50, description="Temperature in Celsius")
    humidity: float = Field(ge=0, le=100, description="Humidity percentage")
    co2: int = Field(ge=400, le=5000, description="CO2 in ppm")
    noise: float = Field(ge=0, le=150, description="Noise in dB")
    timestamp: datetime

class Alert(BaseModel):
    type: str
    severity: str
    message: str
    device_id: str
    start_time: datetime
    resolved: bool