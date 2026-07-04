# master_agent.py (Inside your orchestrate_swarm or specific agent loop)
from tools import search_knowledge_base

async def generate_rag_response(user_query: str):
    # 1. Fetch the relevant mathematical context from Supabase
    verified_data = search_knowledge_base(user_query)
    
    # 2. Build the strict prompt architecture
    system_prompt = f"""You are the NOTEacher Mathematical Tutor.
    Answer the user's question using ONLY the provided verified knowledge base below.
    If the answer is not contained in the text, you must say "I do not have that information."
    Do not hallucinate external facts.

    {verified_data}
    """
    
    conversation = [
        {"role": "system", "content": system_prompt},
        {"role": "user", "content": user_query}
    ]
    
    # 3. Generate the grounded response
    response = await client.chat.completions.create(
        model="gpt-4o",
        messages=conversation
    )
    
    return response.choices[0].message.content