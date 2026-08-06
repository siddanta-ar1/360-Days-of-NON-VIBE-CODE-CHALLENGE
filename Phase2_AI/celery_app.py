# celery_app.py
import os
from celery import Celery
# celery_app.py (Append schedule configuration)
from celery.schedules import crontab
from celery_app import celery_app

# Define the periodic task routing
celery_app.conf.beat_schedule = {
    'weekly-memory-pruning': {
        'task': 'tasks.prune_transient_memory',
        # Executes every Sunday at exactly 1:00 AM UTC
        'schedule': crontab(minute=0, hour=1, day_of_week='sunday'),
        'args': ()
    },
    'daily-telemetry-rollup': {
        'task': 'tasks.rollup_daily_telemetry',
        # Executes every day at Midnight UTC
        'schedule': crontab(minute=0, hour=0),
        'args': ()
    }
}
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