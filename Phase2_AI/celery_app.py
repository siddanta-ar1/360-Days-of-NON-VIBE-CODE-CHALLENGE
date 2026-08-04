# celery_app.py
import os
from celery import Celery

# Configure Celery to use Redis as both the message broker and the result backend
REDIS_URL = os.environ.get("REDIS_URL", "redis://localhost:6379/0")

celery_app = Celery(
    "noteacher_tasks",
    broker=REDIS_URL,
    backend=REDIS_URL
)

celery_app.conf.update(
    task_serializer='json',
    accept_content=['json'],
    result_serializer='json',
    timezone='UTC',
    enable_utc=True,
    # Prevent a single massive PDF from hogging a worker forever
    task_time_limit=600,       # Hard kill after 10 minutes
    task_soft_time_limit=500   # Raise exception after 8.3 minutes
)