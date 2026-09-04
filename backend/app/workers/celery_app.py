from celery import Celery
from app.core.config import settings

# No result backend: we never read task results back in this app, and keeping
# one enabled makes every .delay() call retry against Redis synchronously
# (up to ~19s) whenever Redis is unreachable, blocking the request thread.
celery_app = Celery("data_viz", broker=settings.redis_url)
celery_app.conf.update(
    task_serializer="json",
    result_serializer="json",
    accept_content=["json"],
    task_ignore_result=True,
    broker_connection_retry_on_startup=False,
    broker_connection_timeout=2,
    broker_transport_options={"max_retries": 1},
)
