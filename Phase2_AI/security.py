# security.py
from fastapi import HTTPException, Header, Depends
import jwt # PyJWT for decoding Supabase tokens

# Replace with your actual Supabase JWT Secret
JWT_SECRET = "your-supabase-jwt-secret"

async def verify_premium_tier(authorization: str = Header(...)):
    """
    FastAPI Dependency to cryptographically verify a user's subscription tier.
    """
    try:
        # 1. Extract the Bearer token
        token = authorization.split("Bearer ")[1]
        
        # 2. Decode the payload (DO NOT bypass signature verification in production)
        payload = jwt.decode(token, JWT_SECRET, algorithms=["HS256"], audience="authenticated")
        
        # 3. Extract custom claims (Assuming you appended the Stripe tier to the Supabase user metadata)
        user_tier = payload.get("user_metadata", {}).get("subscription_tier", "free")
        
        # 4. Enforce the Lock
        if user_tier != "premium":
            print(f" RBAC BLOCK: Free user {payload.get('sub')} attempted premium access.")
            raise HTTPException(
                status_code=403, 
                detail="This feature requires a Premium subscription. Please upgrade your account."
            )
            
        return payload

    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired.")
    except Exception as e:
        raise HTTPException(status_code=401, detail="Unauthorized request.")