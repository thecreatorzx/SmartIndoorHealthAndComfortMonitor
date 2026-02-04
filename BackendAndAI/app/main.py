from fastapi import FastAPI
from app.routers import ingest, latest, history, insights, alerts
from app.database import database

app = FastAPI(title = "Smart Indoor Health and Comfort Monitor API")

# Include Routers
app.include_router(ingest.router, prefix="/api")
app.include_router(latest.router, prefix="/api")
app.include_router(history.router, prefix="/api")
app.include_router(insights.router, prefix="/api")
app.include_router(alerts.router, prefix="/api")

# Database connection events
@app.on_event("startup")
async def startup():
    await database.connect()

@app.on_event("shutdown")
async def shutdown():
    await database.disconnect()