-- Create a function to perform Cosine Similarity Search
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding VECTOR(384),
  match_threshold FLOAT, -- e.g., 0.5 (Only return reasonably confident matches)
  match_count INT        -- e.g., 3 (Only return the top 3 chunks to save LLM tokens)
)
RETURNS TABLE (
  document_title TEXT,
  chunk_content TEXT,
  similarity FLOAT
)
LANGUAGE sql STABLE
AS $$
  SELECT
    document_title,
    chunk_content,
    -- The <=> operator calculates the cosine distance. 
    -- 1 - distance gives us the similarity score (1.0 is a perfect match).
    1 - (document_embeddings.embedding <=> query_embedding) AS similarity
  FROM document_embeddings
  WHERE 1 - (document_embeddings.embedding <=> query_embedding) > match_threshold
  ORDER BY similarity DESC
  LIMIT match_count;
$$;