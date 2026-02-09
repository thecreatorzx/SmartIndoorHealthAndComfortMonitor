from sqlalchemy import Table, Column, Integer, Float, String, DateTime, Boolean
from app.database import metadata

readings_table = Table(
    "readings",
    metadata,
    Column("id", Integer, primary_key=True, index=True),
    Column("device_id", String, index=True, nullable=False),
    Column("temperature", Float, nullable=False),
    Column("humidity", Float, nullable=False),
    Column("co2", Integer, nullable=False),
    Column("noise", Float, nullable=False),
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