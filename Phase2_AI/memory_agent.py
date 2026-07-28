# memory_agent.py
import json
import os
from datetime import datetime
from fastapi import BackgroundTasks
from openai import AsyncOpenAI
from supabase import create_client, Client
from sentence_transformers import SentenceTransformer
from logger_config import get_logger

client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"), 
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
)
model = SentenceTransformer('all-MiniLM-L6-v2')

EXTRACTION_PROMPT = """You are an expert Educational Profiler. 
Analyze the provided tutor-student chat transcript. Extract persistent, long-term learning facts about the student.
Focus ONLY on:
1. Specific conceptual weaknesses or misunderstandings.
2. Verified conceptual mastery.
3. Preferred learning modalities (e.g., visual learner, needs step-by-step algebraic breakdowns).

Ignore temporary pleasantries, greetings, or transient confusion.
Return ONLY a valid JSON object matching this schema:
{
  "extracted_facts": [
    "Student struggles with identifying boundary conditions in definite integrals.",
    "Student mastered standard quadratic factoring on July 28."
  ]
}"""

async def harvest_session_memory(user_id: str, transcript_history: list[dict]):
    """
    Background worker that distills raw transcripts into atomic vector memories.
    """
    logger = get_logger()
    
    if len(transcript_history) < 4:
        return # Skip short/trivial conversations

    try:
        # 1. Distill transcript into atomic JSON facts via fast LLM
        formatted_log = "\n".join([f"{msg['role']}: {msg['content']}" for msg in transcript_history])
        
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            temperature=0.0,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": EXTRACTION_PROMPT},
                {"role": "user", "content": f"TRANSCRIPT:\n{formatted_log}"}
            ]
        )
        
        data = json.loads(response.choices[0].message.content)
        facts = data.get("extracted_facts", [])
        
        if not facts:
            logger.info("memory_harvest_empty", user_id=user_id)
            return

        # 2. Vectorize and store each fact atomically
        embeddings = model.encode(facts).tolist()
        records = []
        
        for fact, vector in zip(facts, embeddings):
            records.append({
                "user_id": user_id,
                "fact_content": fact,
                "embedding": vector,
                "created_at": datetime.utcnow().isoformat()
            })
            
        supabase.table("student_cognitive_memory").insert(records).execute()
        logger.info("memory_harvest_success", user_id=user_id, facts_stored=len(records))
        print(f" COGNITIVE HARVEST: Successfully stored {len(records)} pedagogical facts for user {user_id}.")

    except Exception as e:
        logger.error("memory_harvest_failure", error=str(e), user_id=user_id)