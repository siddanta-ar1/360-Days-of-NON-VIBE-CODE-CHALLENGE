# master_agent.py
from fastapi import FastAPI, HTTPException, Depends
from openai import AsyncOpenAI
from quota_manager import check_token_quota, record_token_consumption

app = FastAPI()
client = AsyncOpenAI()

@app.post("/api/chat/agent")
async def process_agent_interaction(user_id: str, user_tier: str, prompt: str):
    # 1. PRE-FLIGHT FIREWALL GUARD
    quota_available = await check_token_quota(user_id, user_tier)
    if not quota_available:
        raise HTTPException(
            status_code=429, 
            detail="Daily compute allocation exhausted. Upgrade to premium tier for expanded access."
        )

    # 2. RUN ARCHITECTURAL WORKLOAD
    # Simulate conversation compilation
    messages = [{"role": "user", "content": prompt}]
    
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=messages
    )
    
    # 3. EXTRACT EXACT USAGE METRICS DIRECTLY FROM PAYLOAD
    usage_data = response.usage
    input_tokens = usage_data.prompt_tokens
    output_tokens = usage_data.completion_tokens
    total_consumed = usage_data.total_tokens

    # 4. POST-FLIGHT METERING DECREMENT
    # Asynchronously record metrics without delaying the client's HTTP response
    await record_token_consumption(user_id, total_consumed)

    return {
        "content": response.choices[0].message.content,
        "metrics": {"prompt": input_tokens, "completion": output_tokens, "total": total_consumed}
    }