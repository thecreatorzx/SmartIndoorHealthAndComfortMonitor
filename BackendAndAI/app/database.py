from databases import Database
from sqlalchemy import create_engine, MetaData
import os
import logging

from app.config import DATABASE_URL

logger = logging.getLogger(__name__)

# Create async database connection
try:
    database = Database(DATABASE_URL)
    logger.debug(f"Database instance created with URL: {DATABASE_URL.split('://')[0]}")
except Exception as e:
    logger.error(f"Error initializing database: {str(e)}", exc_info=True)
    raise

# Create metadata for table definitions
metadata = MetaData()

# Create synchronous engine for table creation
# For SQLite, use check_same_thread=False for async compatibility
try:
    engine = create_engine(
        DATABASE_URL.replace("sqlite+aiosqlite:", "sqlite:"),
        connect_args={"check_same_thread": False}
    )
    logger.debug("Database engine created successfully")
except Exception as e:
    logger.error(f"Error creating database engine: {str(e)}", exc_info=True)
    raise
