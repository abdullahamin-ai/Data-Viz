from fastapi import APIRouter
from app.services.health import check_health
router = APIRouter(tags=["health"])

@router.get("/health")
def health():
    checks = check_health()
    return {"status": "ok" if all(v == "up" for v in checks.values()) else "degraded", "checks": checks}
