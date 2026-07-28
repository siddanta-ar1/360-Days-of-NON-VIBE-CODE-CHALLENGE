-- Create the long-term cognitive memory table
CREATE TABLE student_cognitive_memory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    fact_content TEXT NOT NULL,
    confidence_score FLOAT DEFAULT 1.0,
    embedding VECTOR(384) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create an HNSW index for sub-millisecond similarity recall
CREATE INDEX ON student_cognitive_memory 
USING hnsw (embedding vector_cosine_ops);

-- RPC for retrieving topic-specific user memory
CREATE OR REPLACE FUNCTION match_cognitive_memory (
  target_user_id UUID,
  query_embedding VECTOR(384),
  match_threshold FLOAT DEFAULT 0.60,
  match_count INT DEFAULT 3
)
RETURNS TABLE (
  fact_content TEXT,
  similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    fact_content,
    1 - (embedding <=> query_embedding) AS similarity
  FROM student_cognitive_memory
  WHERE user_id = target_user_id
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;