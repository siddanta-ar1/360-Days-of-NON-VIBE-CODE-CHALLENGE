# stripe_webhook.py
import os
import stripe
from fastapi import APIRouter, Request, HTTPException, Header
from supabase import create_client, Client

router = APIRouter()
stripe.api_key = os.environ.get("STRIPE_SECRET_KEY")
STRIPE_WEBHOOK_SECRET = os.environ.get("STRIPE_WEBHOOK_SECRET")

# Use the Service Role Key to bypass Row Level Security for admin actions
supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"), 
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
)

@router.post("/api/webhooks/stripe")
async def stripe_webhook(request: Request, stripe_signature: str = Header(None)):
    # 1. READ RAW BYTES
    # We must read the raw payload to calculate the HMAC signature correctly
    payload = await request.body()

    try:
        # 2. CRYPTOGRAPHIC VERIFICATION
        # This function throws an error if the signature is invalid or the payload was tampered with
        event = stripe.Webhook.construct_event(
            payload, stripe_signature, STRIPE_WEBHOOK_SECRET
        )
    except ValueError as e:
        raise HTTPException(status_code=400, detail="Invalid payload structure.")
    except stripe.error.SignatureVerificationError as e:
        print("🚨 SECURITY BREACH: Invalid Stripe signature detected.")
        raise HTTPException(status_code=400, detail="Cryptographic verification failed.")

    # 3. ROUTE THE EVENT INTENT
    if event['type'] == 'checkout.session.completed':
        session = event['data']['object']
        
        # We assume you passed the user's Supabase ID in the checkout session metadata
        user_id = session.get("metadata", {}).get("supabase_user_id")
        
        if user_id:
            print(f"💰 Payment Verified! Elevating privileges for user: {user_id}")
            
            # 4. ADMIN PRIVILEGE ELEVATION
            # Update the user's JWT metadata in Supabase Auth directly
            supabase.auth.admin.update_user_by_id(
                user_id,
                user_metadata={"subscription_tier": "premium"}
            )
        else:
            print("Warning: Checkout session completed but no user_id found in metadata.")

    # Always return a 200 OK so Stripe knows we received the event and stops retrying
    return {"status": "success"}