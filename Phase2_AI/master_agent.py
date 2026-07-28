# master_agent.py (Updated Integration)
from fastapi import BackgroundTasks
from memory_agent import harvest_session_memory, model

async def fetch_student_context(user_id: str, prompt: str) -> str:
    """Retrieves relevant historical cognitive facts for the incoming prompt."""
    query_vector = model.encode(prompt).tolist()
    
    response = supabase.rpc(
        'match_cognitive_memory',
        {
            'target_user_id': user_id,
            'query_embedding': query_vector,
            'match_threshold': 0.55,
            'match_count': 3
        }
    ).execute()
    
    matches = response.data
    if not matches:
        return ""
        
    facts_str = "\n".join([f"- {m['fact_content']} (Relevance: {m['similarity']:.2f})" for m in matches])
    return f"\n[LONG-TERM STUDENT COGNITIVE PROFILE]:\n{facts_str}\n"

@app.post("/api/chat/agent")
async def process_agent_interaction(
    user_id: str, 
    prompt: str, 
    chat_history: list[dict], 
    background_tasks: BackgroundTasks
):
    # 1. Inject targeted long-term memory dynamically
    memory_context = await fetch_student_context(user_id, prompt)
    
    system_prompt = (
        "You are the NOTEacher AI Math Tutor. Adapt your teaching style "
        f"strictly according to the student's known profile:\n{memory_context}"
    )
    
    # 2. Execute primary inference...
    messages = [{"role": "system", "content": system_prompt}] + chat_history + [{"role": "user", "content": prompt}]
    response = await client.chat.completions.create(model="gpt-4o", messages=messages)
    answer = response.choices[0].message.content
    
    # 3. Schedule non-blocking memory harvest in the background
    updated_history = chat_history + [
        {"role": "user", "content": prompt},
        {"role": "assistant", "content": answer}
    ]
    background_tasks.add_task(harvest_session_memory, user_id, updated_history)
    
    return {"content": answer}