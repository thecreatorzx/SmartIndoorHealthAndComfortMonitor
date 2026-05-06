import os
import logging
from dotenv import load_dotenv

logger = logging.getLogger(__name__)

try:
    load_dotenv()
    logger.info("Environment variables loaded successfully")
except Exception as e:
    logger.warning(f"Error loading .env file: {str(e)}")

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./test.db")
APIKEY = os.getenv("API_KEY", "myapikey")

# Validate configuration
if APIKEY == "myapikey":
    logger.warning("Using default API key - this is insecure for production. Set API_KEY environment variable.")

logger.debug(f"Configuration loaded - Database type: {DATABASE_URL.split('+')[0] if '+' in DATABASE_URL else DATABASE_URL.split(':')[0]}")