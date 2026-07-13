# master_agent.py (Append diagnostic P0 route)
from logger_config import IncidentSeverity, tag_incident_severity
from supabase import Client

@app.get("/api/diagnostic/p0-outage")
async def simulate_database_collapse():
    """
    Intentionally fires a P0 Fatal exception to test PagerDuty automated phone call escalation.
    """
    print("⚠️ Initiating P0 Infrastructure Collapse Test...")
    
    try:
        # Simulate a database pool timeout / failure
        raise ConnectionRefusedError("Supabase PostgreSQL connection pool exhausted. 0 active nodes responding.")
    except Exception as e:
        # Tag as fatal to trigger the PagerDuty Webhook rule in Sentry
        tag_incident_severity(
            severity=IncidentSeverity.P0_CRITICAL,
            component="database_kernel",
            action_required="RESTART CONNECTION POOL OR PROVISION FAILOVER NODE IMMEDIATELY."
        )
        sentry_sdk.capture_exception(e)
        raise