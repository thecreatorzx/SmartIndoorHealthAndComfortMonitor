from pydantic import BaseModel
from datetime import datetime

class ReadingCreate(BaseModel):
    device_id: str
    temperature: float
    humidity: float
    co2: int
    noise: float
    timestamp: datetime

class Alert(BaseModel):
    type: str
    severity: str
    message: str
    device_id: str
    start_time: datetime
    resolved: bool