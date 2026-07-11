# logger_config.py (Append this custom processor)
import asyncio
from axiom_shipper import enqueue_log

def axiom_dispatch_processor(logger, method_name, event_dict):
    """
    Structlog processor that copies the log dictionary into the Axiom async queue.
    """
    # We must schedule the async enqueue function inside the running event loop
    try:
        loop = asyncio.get_running_loop()
        if loop.is_running():
            # Schedule the queue push without waiting for it to finish
            loop.create_task(enqueue_log(event_dict.copy()))
    except RuntimeError:
        # Happens during synchronous startup/shutdown before the loop exists
        pass
        
    return event_dict

# Ensure axiom_dispatch_processor is added to your structlog.configure(processors=[...]) list!