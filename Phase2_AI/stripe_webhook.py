# stripe_webhook.py (Update exception handling)
from logger_config import IncidentSeverity, tag_incident_severity

@router.post("/api/webhooks/stripe")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    payload = await request.body()
    try:
        event = stripe.Webhook.construct_event(payload, stripe_signature, STRIPE_WEBHOOK_SECRET)
    except stripe.error.SignatureVerificationError as e:
        # 1. PROGRAMMATIC P0 ESCALATION
        tag_incident_severity(
            severity=IncidentSeverity.P0_CRITICAL,
            component="monetization_webhook",
            action_required="IMMEDIATE INVESTIGATION: Possible financial spoofing or secret key compromise."
        )
        
        # 2. Capture explicitly in Sentry with our P0 tags attached
        sentry_sdk.capture_exception(e)
        
        print(" CRITICAL SECURITY BREACH: Stripe HMAC verification failed.")
        raise HTTPException(status_code=400, detail="Cryptographic verification failed.")