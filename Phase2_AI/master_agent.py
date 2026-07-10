# master_agent.py
import time
import uuid
from fastapi import FastAPI, Request
from logger_config import trace_id_var, get_logger

app = FastAPI()

@app.middleware("http")
async def trace_logging_middleware(request: Request, call_next):
    # 1. GENERATE THE TRACE ID
    # The millisecond the payload hits the edge, we assign it a cryptographic UUID
    request_id = str(uuid.uuid4())
    trace_id_var.set(request_id)
    
    logger = get_logger()
    start_time = time.time()
    
    # 2. LOG INGRESS
    logger.info("http_request_started", method=request.method, path=request.url.path)
    
    try:
        # Pass the request down into your application (Vision, Agents, etc.)
        response = await call_next(request)
        
        # 3. LOG EGRESS & LATENCY
        process_time_ms = round((time.time() - start_time) * 1000, 2)
        logger.info(
            "http_request_completed", 
            status_code=response.status_code, 
            latency_ms=process_time_ms
        )
        
        # Optional: Attach the Trace ID to the outgoing headers so the frontend can read it
        response.headers["X-Trace-ID"] = request_id
        return response
        
    except Exception as e:
        # 4. CAPTURE FATAL CRASHES
        logger.error("http_request_failed", error=str(e), type=type(e).__name__)
        raise