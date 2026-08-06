# tasks.py
import time
from celery_app import celery_app
from logger_config import get_logger
# tasks.py (Append scheduled task)
from celery_app import celery_app
from logger_config import get_logger
from supabase import create_client
import os

supabase = create_client(os.environ.get("SUPABASE_URL"), os.environ.get("SUPABASE_SERVICE_ROLE_KEY"))

@celery_app.task(name="tasks.prune_transient_memory")
def prune_transient_memory():
    """
    Background cron job to delete transient cognitive facts older than 30 days.
    """
    logger = get_logger()
    logger.info("memory_pruning_started")
    
    try:
        # Example Supabase RPC or direct table query to delete old records
        response = supabase.table("student_cognitive_memory") \
            .delete() \
            .lt("created_at", "now() - interval '30 days'") \
            .execute()
            
        deleted_count = len(response.data)
        logger.info("memory_pruning_complete", deleted_records=deleted_count)
        return {"status": "SUCCESS", "deleted_records": deleted_count}
        
    except Exception as e:
        logger.error("memory_pruning_failed", error=str(e))
        raise


@celery_app.task(bind=True, name="process_textbook_pdf")
def process_textbook_pdf(self, file_path: str, document_id: str, user_id: str):
    """
    Heavy CPU-bound task that runs outside the web server's event loop.
    """
    logger = get_logger()
    logger.info("pdf_processing_started", document_id=document_id, task_id=self.request.id)
    
    try:
        # Update state so the frontend can poll for progress
        self.update_state(state='PROGRESS', meta={'status': 'Extracting text from PDF...'})
        time.sleep(2) # Simulate OCR/Text Extraction
        
        self.update_state(state='PROGRESS', meta={'status': 'Generating vector embeddings...'})
        time.sleep(5) # Simulate heavy SentenceTransformer encoding
        
        self.update_state(state='PROGRESS', meta={'status': 'Writing chunks to PostgreSQL...'})
        time.sleep(1) # Simulate DB insertion
        
        logger.info("pdf_processing_complete", document_id=document_id)
        return {"status": "SUCCESS", "document_id": document_id, "chunks_processed": 450}
        
    except Exception as e:
        logger.error("pdf_processing_failed", error=str(e), document_id=document_id)
        raise self.retry(exc=e, countdown=60, max_retries=3)