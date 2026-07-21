# tools.py (Updated search_knowledge_base function)
from prompt_compressor import compress_rag_context

def search_knowledge_base(user_query: str) -> str:
    print(f"🔍 Searching Vector DB for: '{user_query}'")
    query_vector = model.encode(user_query).tolist()
    
    # Fetch top 3 document chunks from pgvector
    response = supabase.rpc(
        'match_documents',
        {'query_embedding': query_vector, 'match_threshold': 0.25, 'match_count': 3}
    ).execute()
    
    matches = response.data
    if not matches:
        return "No relevant information found."
        
    # Extract raw content strings
    raw_chunk_texts = [match['chunk_content'] for match in matches]
    
    # EXECUTE DYNAMIC COMPRESSION
    pruned_text, telemetry = compress_rag_context(user_query, raw_chunk_texts, similarity_threshold=0.35)
    
    # Format the ultra-dense context block
    injected_context = f"--- VERIFIED PRUNED KNOWLEDGE BASE (Token Reduction: {telemetry['reduction_pct']}%) ---\n"
    injected_context += pruned_text
    
    return injected_context