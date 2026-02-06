from fastapi import FastAPI, Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from app.logging_config import setup_logging

setup_logging(log_level=logging.INFO)
logger = logging.getLogger(__name__)

from app.routers import ingest, latest, history, insights, alerts
from app.database import database
from app.tasks import monitor_readings
import asyncio
import logging
import time

# Setup logging configuration

app = FastAPI(title = "Smart Indoor Health and Comfort Monitor API")

# Initialize app state for monitoring task
app.state.monitoring_task = None

# Add logging middleware for request/response tracking
class LoggingMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        request_body = await request.body()
        
        # Log incoming request
        logger.info(f"Incoming {request.method} {request.url.path} from {request.client.host if request.client else 'unknown'}")
        if request_body and request.method in ["POST", "PUT"]:
            try:
                logger.debug(f"Request body: {request_body.decode()[:500]}")
            except (UnicodeDecodeError, AttributeError):
                logger.debug("Could not decode request body")
        
        # Process request
        response = await call_next(request)
        
        # Log response
        process_time = time.time() - start_time
        logger.info(f"Response {response.status_code} for {request.method} {request.url.path} - {process_time:.3f}s")
        
        return response

app.add_middleware(LoggingMiddleware)

# Include Routers
app.include_router(ingest.router, prefix="/api")
app.include_router(latest.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(insights.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")

# Database connection events
@app.on_event("startup")
async def startup():
    try:
        await database.connect()
        logger.info("Database connected successfully")
    except Exception as e:
        logger.critical(f"Failed to connect to database: {str(e)}", exc_info=True)
        raise
    
    # Start background monitoring task
    try:
        app.state.monitoring_task = asyncio.create_task(background_monitor())
        logger.info("Alert monitoring started")
    except Exception as e:
        logger.error(f"Failed to start monitoring task: {str(e)}", exc_info=True)
        raise

@app.on_event("shutdown")
async def shutdown():
    if hasattr(app.state, 'monitoring_task') and app.state.monitoring_task:
        app.state.monitoring_task.cancel()
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
            logger.exception(f"Error in monitoring task: {type(e).__name__}: {str(e)}")
            await asyncio.sleep(60)  # Wait before retrying