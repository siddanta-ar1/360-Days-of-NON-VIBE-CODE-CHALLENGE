# axiom_shipper.py
import asyncio
import os
import httpx
from typing import Dict, Any, List

AXIOM_TOKEN = os.environ.get("AXIOM_API_TOKEN")
AXIOM_DATASET = os.environ.get("AXIOM_DATASET", "noteacher-telemetry")
AXIOM_INGEST_URL = f"https://api.axiom.co/v1/datasets/{AXIOM_DATASET}/ingest"

# In-memory buffer to decouple log generation from network I/O
log_queue: asyncio.Queue = asyncio.Queue(maxsize=5000)

async def enqueue_log(log_entry: Dict[str, Any]):
    """
    Pushes a structured log into the memory queue without blocking the application.
    If the queue is full (network degradation), it drops the oldest log to prevent OOM.
    """
    try:
        if log_queue.full():
            log_queue.get_nowait()  # Drop oldest telemetry to protect host memory
        log_queue.put_nowait(log_entry)
    except Exception as e:
        print(f"⚠️ Telemetry queue failure: {str(e)}")

async def axiom_batch_worker():
    """
    Background loop that drains the queue and ships batches over HTTPS.
    """
    print("🚀 Axiom Telemetry Shipper initialized in background.")
    headers = {
        "Authorization": f"Bearer {AXIOM_TOKEN}",
        "Content-Type": "application/json"
    }
    
    async with httpx.AsyncClient(timeout=5.0) as client:
        while True:
            batch: List[Dict[str, Any]] = []
            try:
                # 1. Wait up to 2 seconds for the first log to arrive
                first_log = await asyncio.wait_for(log_queue.get(), timeout=2.0)
                batch.append(first_log)
                log_queue.task_done()
                
                # 2. Drain up to 49 more logs immediately if they are sitting in the queue
                while len(batch) < 50 and not log_queue.empty():
                    batch.append(log_queue.get_nowait())
                    log_queue.task_done()
                    
            except asyncio.TimeoutError:
                # Loop timed out with no logs, just continue listening
                continue
            except Exception as e:
                print(f" Worker queue extraction error: {str(e)}")
                continue

            # 3. Transmit the batch to Axiom
            if batch and AXIOM_TOKEN:
                try:
                    response = await client.post(AXIOM_INGEST_URL, json=batch, headers=headers)
                    if response.status_code not in (200, 202):
                        print(f" Axiom rejection ({response.status_code}): {response.text}")
                except Exception as e:
                    print(f" Axiom network transmission failure: {str(e)}")