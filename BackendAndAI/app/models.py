from sqlalchemy import Table, Column, Integer, Float, String, DateTime, Boolean
from app.database import metadata

readings_table = Table(
    "readings",
    metadata,
    Column("id", Integer, primary_key=True, index=True),
    Column("device_id", String, index=True, nullable=False),
    Column("temperature", Float, nullable=False, CheckConstraint('temperature >= -50 AND temperature <= 50')),
    Column("humidity", Float, nullable=False, CheckConstraint('humidity >= 0 AND humidity <= 100')),
    Column("co2", Integer, nullable=False, CheckConstraint('co2 >= 400 AND co2 <= 5000')),
    Column("noise", Float, nullable=False, CheckConstraint('noise >= 0 AND noise <= 150'))
    Column("timestamp", DateTime, nullable=False),
)
# Alerts Table
alerts_table = Table(
    "alerts",
    metadata,
    Column("id", Integer, primary_key=True, index=True),
    Column("type", String, nullable=False),
    Column("severity", String, nullable=False),
    Column("message", String, nullable=False),
    Column("device_id", String, index=True, nullable=False),
    Column("start_time", DateTime, nullable=False),
    Column("resolved", Boolean, default=False),
)