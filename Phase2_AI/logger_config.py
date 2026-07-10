# logger_config.py
import uuid
import structlog
from contextvars import ContextVar

# 1. THE CONTEXT VARIABLE
# This safely holds a unique ID for the lifecycle of a single async request
trace_id_var: ContextVar[str] = ContextVar("trace_id", default="SYSTEM_INIT")

# 2. CONFIGURE THE RENDERER
# We strip out human-readable text and force the output to strict JSON
structlog.configure(
    processors=[
        structlog.processors.add_log_level,
        structlog.processors.TimeStamper(fmt="iso"), # ISO 8601 Timestamps
        structlog.processors.JSONRenderer()          # Machine-parsable JSON
    ]
)

def get_logger():
    """
    Returns a logger instance that automatically injects the current 
    asynchronous Trace ID into every payload it generates.
    """
    return structlog.get_logger().bind(trace_id=trace_id_var.get())