-- 1. Enable the vector extension
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create the specialized knowledge base table
CREATE TABLE document_embeddings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_title TEXT NOT NULL,
    chunk_content TEXT NOT NULL,
    -- We use 384 dimensions to match our local MiniLM model
    embedding VECTOR(384) 
);