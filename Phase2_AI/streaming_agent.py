# streaming_agent.py
import json
import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from openai import AsyncOpenAI
from pydantic import BaseModel

router = APIRouter()
client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

class StreamRequest(BaseModel):
    prompt: str
    user_id: str

async def generate_token_stream(prompt: str):
    """
    Asynchronous generator that yields SSE-formatted chunks as OpenAI computes them.
    """
    try:
        # 1. Initiate the stream by passing stream=True to the API
        stream = await client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {"role": "system", "content": "You are the NOTEacher AI Tutor. Respond concisely."},
                {"role": "user", "content": prompt}
            ],
            stream=True, # CRITICAL: Commands OpenAI to stream raw tokens
            temperature=0.7
        )

        # 2. Iterate over the incoming network chunks in real-time
        async for chunk in stream:
            token = chunk.choices[0].delta.content
            if token is not None:
                # Format exactly as Server-Sent Events require: "data: <payload>\n\n"
                payload = json.dumps({"token": token, "done": False})
                yield f"data: {payload}\n\n"

        # 3. Send terminal signal to close the client stream cleanly
        yield f"data: {json.dumps({'token': '', 'done': True})}\n\n"

    except Exception as e:
        error_payload = json.dumps({"error": str(e), "done": True})
        yield f"data: {error_payload}\n\n"

@router.post("/api/chat/stream")
async def stream_agent_response(request: StreamRequest):
    # Return a StreamingResponse with the strict SSE MIME type
    return StreamingResponse(
        generate_token_stream(request.prompt),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no" # Prevents Nginx from buffering the stream!
        }
    )