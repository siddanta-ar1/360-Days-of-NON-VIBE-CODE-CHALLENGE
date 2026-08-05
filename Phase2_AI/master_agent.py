# master_agent.py (Append this route)
from celery.result import AsyncResult
from celery_app import celery_app

@app.get("/api/documents/status/{task_id}")
async def get_task_status(task_id: str):
    """
    Ultra-fast lookup endpoint that queries Redis for the current state
    of a background Celery task.
    """
    # Fetch the task object by ID from the Redis backend
    task_result = AsyncResult(task_id, app=celery_app)
    
    # Base response structure
    response = {
        "task_id": task_id,
        "state": task_result.state,
    }
    
    if task_result.state == 'PENDING':
        # Task is waiting in the queue
        response["status"] = "Waiting for an available worker..."
        
    elif task_result.state == 'PROGRESS':
        # Task is currently running; grab the custom meta info we set yesterday
        response["status"] = task_result.info.get('status', 'Processing...')
        
    elif task_result.state == 'SUCCESS':
        # Task finished completely
        response["status"] = "Complete"
        response["result"] = task_result.result # E.g., {"chunks_processed": 450}
        
    elif task_result.state == 'FAILURE':
        # Task threw an unhandled exception
        response["status"] = "Failed"
        response["error"] = str(task_result.info)
        
    return response