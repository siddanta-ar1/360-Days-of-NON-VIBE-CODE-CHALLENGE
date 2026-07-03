# ingest_knowledge.py
import os
from supabase import create_client, Client
from sentence_transformers import SentenceTransformer
from langchain_text_splitters import RecursiveCharacterTextSplitter

# 1. INITIALIZE INFRASTRUCTURE
supabase: Client = create_client(
    os.environ.get("SUPABASE_URL"), 
    os.environ.get("SUPABASE_SERVICE_ROLE_KEY") # Needs Admin rights to write to DB
)

# Load the local model into RAM (Downloads ~80MB on first run)
print("Loading embedding model...")
model = SentenceTransformer('all-MiniLM-L6-v2')

def ingest_document(title: str, raw_text: str):
    print(f"Slicing document: {title}...")
    
    # 2. THE CHUNKING STRATEGY
    # We split into 500-character chunks with a 50-character overlap. 
    # Overlap prevents cutting a crucial sentence in half.
    text_splitter = RecursiveCharacterTextSplitter(
        chunk_size=500,
        chunk_overlap=50,
        length_function=len,
        is_separator_regex=False,
    )
    
    chunks = text_splitter.split_text(raw_text)
    print(f"Created {len(chunks)} contextual chunks. Vectorizing...")
    
    # 3. VECTORIZATION & UPLOAD BATCHING
    # Process and upload in batches to avoid overwhelming the network
    batch_size = 100
    for i in range(0, len(chunks), batch_size):
        batch_chunks = chunks[i:i + batch_size]
        
        # Convert the text chunks into a list of 384-dimensional mathematical arrays
        embeddings = model.encode(batch_chunks).tolist()
        
        # Prepare the payload for Supabase
        payload = []
        for chunk_text, embedding_vector in zip(batch_chunks, embeddings):
            payload.append({
                "document_title": title,
                "chunk_content": chunk_text,
                "embedding": embedding_vector
            })
            
        # 4. DATABASE INJECTION
        supabase.table("document_embeddings").insert(payload).execute()
        print(f"Uploaded batch {i // batch_size + 1}")

    print(" Ingestion Complete.")

if __name__ == "__main__":
    # Test the pipeline with a mock chapter
    sample_text = """
    Calculus is the mathematical study of continuous change. 
    The two major branches are differential calculus and integral calculus.
    Differential calculus concerns instantaneous rates of change, and the slopes of curves.
    Integral calculus concerns accumulation of quantities, and areas under or between curves.
    These two branches are related to each other by the fundamental theorem of calculus.
    """
    ingest_document("Math_101_Intro", sample_text)