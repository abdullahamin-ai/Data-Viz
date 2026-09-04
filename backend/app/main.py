import logging, subprocess, sys
from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from app.core.config import settings
from app.core.db import ensure_database
from app.core.logging_config import setup_logging
from app.exceptions.handlers import validation_exception_handler, generic_exception_handler
from app.middleware.rate_limit import rate_limit
from app.routers import auth, upload, chart_data, dashboards, health

setup_logging()
log = logging.getLogger("main")

@asynccontextmanager
async def lifespan(app: FastAPI):
    ensure_database()
    subprocess.run([sys.executable, "-m", "alembic", "upgrade", "head"], check=True)
    log.info("APP_START | migrations=ready")
    yield

app = FastAPI(title=settings.app_name, lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=settings.cors_list, allow_credentials=True,
                   allow_methods=["GET","POST","PUT","DELETE"], allow_headers=["*"])
app.middleware("http")(rate_limit)
app.add_exception_handler(RequestValidationError, validation_exception_handler)
app.add_exception_handler(Exception, generic_exception_handler)

app.include_router(auth.router)
app.include_router(upload.router)
app.include_router(chart_data.router)
app.include_router(dashboards.router)
app.include_router(health.router)

@app.get("/")
def root():
    return {"name": settings.app_name, "status": "running"}