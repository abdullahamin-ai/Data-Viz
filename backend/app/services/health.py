import logging, requests
from sqlalchemy import text
from app.core.config import settings
from app.core.db import SessionLocal
import redis

log = logging.getLogger("health")

def check_health():
    result = {"db": "down", "redis": "down", "ollama": "down"}
    try:
        with SessionLocal() as db:
            db.execute(text("SELECT 1"))
        result["db"] = "up"
    except Exception as exc:
        log.error("DB_ERROR | health_check=%s", exc)
    try:
        redis.Redis.from_url(settings.redis_url, socket_connect_timeout=2).ping()
        result["redis"] = "up"
    except Exception as exc:
        log.error("REDIS_ERROR | health_check=%s", exc)
    try:
        requests.get(f"{settings.ollama_host.rstrip('/')}/api/tags", timeout=2).raise_for_status()
        result["ollama"] = "up"
    except Exception as exc:
        log.warning("OLLAMA_ERROR | health_check=%s", exc)
    return result
