from app.workers.celery_app import celery_app

@celery_app.task(name="process_dataset")
def process_dataset(dataset_id: int):
    # The API performs small-file parsing synchronously so it can return chart metadata.
    # This task is the extension point for large-file processing and is wired from day one.
    return {"dataset_id": dataset_id, "status": "processed"}
