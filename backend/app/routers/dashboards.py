from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.dashboard import Dashboard
from app.models.dataset import Dataset
from app.models.user import User
from app.routers.deps import current_user
from app.schemas.dashboard import DashboardCreate, DashboardOut, DashboardUpdate

router = APIRouter(prefix="/api/dashboards", tags=["dashboards"])

def out(d):
    return DashboardOut(id=d.id, dataset_id=d.dataset_id, name=d.name, chart_configs=d.chart_configs,
                        created_at=d.created_at.isoformat(), updated_at=d.updated_at.isoformat())

@router.post("", response_model=DashboardOut, status_code=201)
def create(payload: DashboardCreate, user: User = Depends(current_user), db: Session = Depends(get_db)):
    dataset = db.get(Dataset, payload.dataset_id)
    if not dataset or dataset.user_id != user.id:
        raise HTTPException(404, "Dataset not found.")
    d = Dashboard(user_id=user.id, dataset_id=dataset.id, name=payload.name, chart_configs=payload.chart_configs)
    db.add(d); db.commit(); db.refresh(d)
    return out(d)

@router.get("")
def list_dashboards(page: int = Query(1, ge=1), page_size: int = Query(20, ge=1, le=100),
                    user: User = Depends(current_user), db: Session = Depends(get_db)):
    q = db.query(Dashboard).filter(Dashboard.user_id == user.id).order_by(Dashboard.updated_at.desc())
    total = q.count()
    items = q.offset((page-1)*page_size).limit(page_size).all()
    return {"items": [out(d).model_dump() for d in items], "page": page, "page_size": page_size, "total": total}

@router.get("/{dashboard_id}", response_model=DashboardOut)
def get_one(dashboard_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    d = db.get(Dashboard, dashboard_id)
    if not d or d.user_id != user.id:
        raise HTTPException(404, "Dashboard not found.")
    return out(d)

@router.put("/{dashboard_id}", response_model=DashboardOut)
def update(dashboard_id: int, payload: DashboardUpdate, user: User = Depends(current_user), db: Session = Depends(get_db)):
    d = db.get(Dashboard, dashboard_id)
    if not d or d.user_id != user.id:
        raise HTTPException(404, "Dashboard not found.")
    d.name = payload.name
    d.chart_configs = payload.chart_configs
    db.add(d); db.commit(); db.refresh(d)
    return out(d)

@router.delete("/{dashboard_id}")
def delete(dashboard_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    d = db.get(Dashboard, dashboard_id)
    if not d or d.user_id != user.id:
        raise HTTPException(404, "Dashboard not found.")
    db.delete(d); db.commit()
    return {"message": "Dashboard deleted."}
