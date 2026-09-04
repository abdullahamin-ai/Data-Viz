from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.dataset import Dataset
from app.models.user import User
from app.routers.deps import current_user
from app.services.aggregation import aggregate

router = APIRouter(prefix="/api/chart-data", tags=["chart-data"])

@router.get("/{dataset_id}")
def chart_data(dataset_id: int, x: str, y: str | None = None, aggregation: str = "sum",
               user: User = Depends(current_user), db: Session = Depends(get_db)):
    dataset = db.get(Dataset, dataset_id)
    if not dataset or dataset.user_id != user.id:
        raise HTTPException(404, "Dataset not found.")
    try:
        data = aggregate(dataset.data, dataset.columns, x, y, aggregation)
    except ValueError as exc:
        raise HTTPException(400, str(exc))
    return {"dataset_id": dataset_id, "x": x, "y": y, "data": data}
