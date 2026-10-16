"""
NammaConnect FastAPI Application
Kannada Learning and Communication Platform
"""
from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import logging
import time

from app.config import settings
from app.database import engine, Base
from app.routers import categories, scenarios, offline, admin

# Configure logging (never log sensitive data)
logging.basicConfig(level=logging.INFO if not settings.debug else logging.DEBUG)
logger = logging.getLogger("nammaconnect")

app = FastAPI(
    title="NammaConnect API",
    description="Kannada Learning and Communication Platform API",
    version=settings.app_version,
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS - allow local development origins and configured frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        settings.frontend_origin,
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://[::1]:3000",
    ],
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# Request timing middleware
@app.middleware("http")
async def add_process_time_header(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    process_time = time.time() - start_time
    response.headers["X-Process-Time"] = str(process_time)
    return response


# Global error handler - never expose stack traces
@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Unhandled error on {request.url}: {exc}")
    return JSONResponse(
        status_code=500,
        content={"detail": "An internal error occurred. Please try again."},
    )


# Include API routers
API_PREFIX = "/api/v1"

app.include_router(categories.router, prefix=API_PREFIX)
app.include_router(scenarios.router, prefix=API_PREFIX)
app.include_router(offline.router, prefix=API_PREFIX)
app.include_router(admin.router, prefix=API_PREFIX)


@app.get("/health", tags=["health"])
@app.get("/api/v1/health", tags=["health"])
def health_check():
    """Health check endpoint — does not expose sensitive configuration."""
    from sqlalchemy import text
    from app.database import SessionLocal
    db_status = "ok"
    try:
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
    except Exception as e:
        logger.error(f"DB health check failed: {e}")
        db_status = "error"

    return {
        "status": "ok" if db_status == "ok" else "degraded",
        "version": settings.app_version,
        "database": db_status,
    }


@app.get("/", tags=["root"])
def root():
    return {
        "name": "NammaConnect API",
        "version": settings.app_version,
        "docs": "/docs",
    }
