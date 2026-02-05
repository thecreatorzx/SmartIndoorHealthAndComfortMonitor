from databases import Database
from sqlalchemy import create_engine, MetaData
import os

from app.config import DATABASE_URL

# Create async database connection
database = Database(DATABASE_URL)

# Create metadata for table definitions
metadata = MetaData()

# Create synchronous engine for table creation
# For SQLite, use check_same_thread=False for async compatibility
engine = create_engine(
    DATABASE_URL.replace("sqlite+aiosqlite:", "sqlite:"),
    connect_args={"check_same_thread": False}
)
