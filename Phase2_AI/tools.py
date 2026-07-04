# tools.py
import os
from supabase import create_client, Client
from sentence_transformers import SentenceTransformer

supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"), 
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
)

# Load the exact same model used in yesterday's ingestion script
model = SentenceTransformer('all-MiniLM-L6-v2')

def search_knowledge_base(user_query: str) -> str:
    """
    Converts a query to a vector, searches PostgreSQL, and returns the formatted text.
    """
    print(f"🔍 Searching Vector DB for: '{user_query}'")
    
    # 1. Vectorize the search query
    query_vector = model.encode(user_query).tolist()
    
    # 2. Execute the Supabase RPC function
    response = supabase.rpc(
        'match_documents',
        {
            'query_embedding': query_vector,
            'match_threshold': 0.3,
            'match_count': 3
        }
    ).execute()
    
    matches = response.data
    
    if not matches:
        return "No relevant information found in the verified knowledge base."
        
    # 3. Format the retrieved chunks into a single context string
    injected_context = "--- VERIFIED KNOWLEDGE BASE ---\n"
    for match in matches:
        injected_context += f"Source: {match['document_title']} (Confidence: {match['similarity']:.2f})\n"
        injected_context += f"{match['chunk_content']}\n\n"
        
    return injected_context