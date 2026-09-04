import logging
from fastapi import APIRouter, Depends, File, UploadFile, HTTPException
from fastapi.concurrency import run_in_threadpool
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.dataset import Dataset
from app.models.user import User
from app.routers.deps import current_user
from app.schemas.dataset import DatasetOut
from app.services.file_parser import parse_upload
from app.services.chart_suggestion import suggest_charts
from app.services.ollama_client import get_ai_suggestions
from app.workers.file_processing import process_dataset

router = APIRouter(prefix="/api/upload", tags=["upload"])
log = logging.getLogger("upload")

@router.post("", response_model=DatasetOut)
async def upload_dataset(file: UploadFile = File(...), user: User = Depends(current_user), db: Session = Depends(get_db)):
    try:
        file_type, rows, types = await parse_upload(file)
    except ValueError as exc:
        raise HTTPException(400, str(exc))
    dataset = Dataset(
        user_id=user.id, filename=file.filename or "dataset",
        file_type=file_type, row_count=len(rows), columns=types, data=rows
    )
    db.add(dataset); db.commit(); db.refresh(dataset)
    try:
        # .delay() also talks to Redis (the broker) and can block briefly if
        # Redis is unreachable; keep it off the event loop too.
        await run_in_threadpool(process_dataset.delay, dataset.id)
    except Exception as exc:
        log.warning("WORKER_ERROR | enqueue_failed=%s", exc)
    # get_ai_suggestions() makes a blocking HTTP call (requests) to Ollama;
    # running it inline in this async route would freeze the whole event loop
    # (and every other in-flight request) for up to its timeout whenever
    # Ollama is slow or unreachable. Offload it to a worker thread instead.
    ai = await run_in_threadpool(get_ai_suggestions, types, suggest_charts(types))
    return DatasetOut(id=dataset.id, filename=dataset.filename, file_type=dataset.file_type,
                      row_count=dataset.row_count, columns=dataset.columns,
                      suggestions=ai["suggestions"], preview=rows[:5])

@router.get("/{dataset_id}", response_model=DatasetOut)
def get_dataset(dataset_id: int, user: User = Depends(current_user), db: Session = Depends(get_db)):
    # Saved dashboards ko edit karte waqt bhi "Quick start" suggestions aur
    # column dropdowns chahiye -- Saved page se aane par sirf dashboard config
    # milta hai, dataset ki columns/suggestions nahi. Yeh endpoint unhe
    # dobara-fetch karne deta hai, upload ke waqt jaisa hi response shape.
    dataset = db.get(Dataset, dataset_id)
    if not dataset or dataset.user_id != user.id:
        raise HTTPException(404, "Dataset not found.")
    ai = get_ai_suggestions(dataset.columns, suggest_charts(dataset.columns))
    return DatasetOut(id=dataset.id, filename=dataset.filename, file_type=dataset.file_type,
                      row_count=dataset.row_count, columns=dataset.columns,
                      suggestions=ai["suggestions"], preview=(dataset.data or [])[:5])