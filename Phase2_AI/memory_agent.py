# master_agent.py
from fastapi import APIRouter, BackgroundTasks, UploadFile
from tasks import process_textbook_pdf
import uuid

router = APIRouter()

@router.post("/api/documents/upload", status_code=202)
async def upload_document(file: UploadFile, user_id: str):
    # 1. Save the file quickly to disk/S3 (omitted for brevity)
    document_id = str(uuid.uuid4())
    temp_file_path = f"/tmp/{document_id}.pdf"
    
    # 2. Fire and Forget: Push the heavy parsing task into the Redis queue
    # Using .delay() delegates execution to the Celery worker
    task = process_textbook_pdf.delay(
        file_path=temp_file_path,
        document_id=document_id,
        user_id=user_id
    )
    
    # 3. Return instantly (202 Accepted) so the user's browser doesn't hang
    return {
        "message": "Document accepted for processing.",
        "document_id": document_id,
        "task_id": task.id, # Frontend will use this ID to poll for status updates
        "status_url": f"/api/documents/status/{task.id}"
    }