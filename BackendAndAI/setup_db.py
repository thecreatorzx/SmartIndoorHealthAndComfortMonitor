"""
Setup script to initialize the database with tables
"""
import sqlite3
import os
from app.config import DATABASE_URL

def setup_database():
    """Create all tables in the database"""
    # Extract database path from SQLite URL
    db_path = DATABASE_URL.replace("sqlite+aiosqlite:///", "").replace("sqlite:///", "")
    
    print(f"Creating database at: {db_path}")
    
    conn = sqlite3.connect(db_path)
    cursor = conn.cursor()
    
    # Create readings table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS readings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_id TEXT NOT NULL,
        temperature REAL NOT NULL,
        humidity REAL NOT NULL,
        co2 INTEGER NOT NULL,
        noise REAL NOT NULL,
        timestamp DATETIME NOT NULL
    )
    """)
    
    # Create index on device_id and timestamp for faster queries
    cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_readings_device_id ON readings(device_id)
    """)
    cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_readings_timestamp ON readings(timestamp)
    """)
    
    # Create alerts table
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS alerts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        severity TEXT NOT NULL,
        message TEXT NOT NULL,
        device_id TEXT NOT NULL,
        start_time DATETIME NOT NULL,
        resolved BOOLEAN DEFAULT 0
    )
    """)
    
    # Create index on device_id for faster queries
    cursor.execute("""
    CREATE INDEX IF NOT EXISTS idx_alerts_device_id ON alerts(device_id)
    """)
    
    conn.commit()
    conn.close()
    
    print("✓ Database tables created successfully!")
    print("Tables created:")
    print("  - readings (with indexes on device_id, timestamp)")
    print("  - alerts (with index on device_id)")

if __name__ == "__main__":
    setup_database()
