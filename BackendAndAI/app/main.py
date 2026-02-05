from fastapi import FastAPI
from app.routers import ingest, latest, history, insights, alerts
from app.database import database
from app.tasks import monitor_readings
import asyncio
import logging

logger = logging.getLogger(__name__)

app = FastAPI(title = "Smart Indoor Health and Comfort Monitor API")

# Include Routers
app.include_router(ingest.router, prefix="/api")
app.include_router(latest.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(insights.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")

# Background task for monitoring
monitoring_task = None

# Database connection events
@app.on_event("startup")
async def startup():
    await database.connect()
    logger.info("Database connected")
    
    # Start background monitoring task
    global monitoring_task
    monitoring_task = asyncio.create_task(background_monitor())
    logger.info("Alert monitoring started")

@app.on_event("shutdown")
async def shutdown():
    global monitoring_task
    if monitoring_task:
        monitoring_task.cancel()
    await database.disconnect()
    logger.info("Database disconnected and monitoring stopped")

async def background_monitor():
    """Continuous background task to monitor readings"""
    while True:
        try:
            await monitor_readings()
            await asyncio.sleep(60)  # Check every 1 minute
        except asyncio.CancelledError:
            logger.info("Monitoring task cancelled")
            break
        except Exception as e:
            logger.error(f"Error in monitoring task: {str(e)}", exc_info=True)
            await asyncio.sleep(60)  # Wait before retrying