# logger_config.py (Append Sentry initialization)
import os
import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
from sentry_sdk.integrations.starlette import StarletteIntegration

# 1. INITIALIZE SENTRY KERNEL
sentry_sdk.init(
    dsn=os.environ.get("SENTRY_DSN"),
    integrations=[
        StarletteIntegration(transaction_style="endpoint"),
        FastApiIntegration(transaction_style="endpoint"),
    ],
    # Set traces_sample_rate to 1.0 to capture 100% of performance spans in development
    # In high-volume production, lower this to 0.1 (10%) to save quota
    traces_sample_rate=1.0,
    # Send default PII (like user IP and headers) safely
    send_default_pii=True,
    environment=os.environ.get("ENVIRONMENT", "production")
)

def bind_sentry_trace_context(request_id: str):
    """
    Stitches our internal structured logging Trace ID directly to Sentry's error scope.
    This allows 1-click correlation between Axiom logs and Sentry stack traces.
    """
    sentry_sdk.set_tag("trace_id", request_id)
    # You can also set custom context about the system state
    sentry_sdk.set_context("system_state", {
        "memory_tier": "ephemeral_ram",
        "orchestration": "swarm_v1"
    })