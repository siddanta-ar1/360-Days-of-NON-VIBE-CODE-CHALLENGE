# quota_manager.py
import datetime
import os
import redis.asyncio as redis

# Connect to your remote Redis instance
redis_client = redis.from_url(os.environ.get("REDIS_URL"))

# Strict operational boundaries based on tier subscription
TIER_LIMITS = {
    "free": 50000,      # 50k tokens per day limit
    "premium": 1000000  # 1M tokens per day limit
}

async def check_token_quota(user_id: str, tier: str) -> bool:
    """
    Verifies if a user has sufficient token budget remaining for the current day.
    """
    current_day = datetime.date.today().isoformat()
    quota_key = f"user:{user_id}:quota:{current_day}"
    
    # Retrieve current usage from RAM cache
    current_usage = await redis_client.get(quota_key)
    
    if current_usage is None:
        # Initialize token bucket tracking if this is the first interaction of the day
        return True
        
    allowed_limit = TIER_LIMITS.get(tier, TIER_LIMITS["free"])
    
    if int(current_usage) >= allowed_limit:
        print(f" QUOTA BREACHED: User {user_id} has exhausted their daily limit.")
        return False
        
    return True

async def record_token_consumption(user_id: str, total_tokens: int):
    """
    Atomically increments the daily token consumption count in memory.
    """
    current_day = datetime.date.today().isoformat()
    quota_key = f"user:{user_id}:quota:{current_day}"
    
    # Execute an atomic increment command
    new_total = await redis_client.incrby(quota_key, total_tokens)
    
    # If the key was freshly created, set it to expire in 24 hours to clear cache overhead
    if new_total == total_tokens:
        await redis_client.expire(quota_key, 86400)
        
    print(f" METRICS METERED: User {user_id} consumed {total_tokens} tokens. Daily total: {new_total}")