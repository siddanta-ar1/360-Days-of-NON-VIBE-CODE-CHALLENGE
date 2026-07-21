# prompt_compressor.py
import re
import time
import numpy as np
from sentence_transformers import SentenceTransformer
from logger_config import get_logger

# Reuse our loaded local embedding model from Day 188
model = SentenceTransformer('all-MiniLM-L6-v2')

def slice_into_sentences(text: str) -> list[str]:
    """
    Splits raw document paragraphs into clean, individual sentence strings.
    """
    # Regex splits on periods, question marks, or exclamation points followed by whitespace
    raw_sentences = re.split(r'(?<=[.!?])\s+', text.strip())
    # Filter out empty strings or tiny header fragments under 15 characters
    return [s.strip() for s in raw_sentences if len(s.strip()) > 15]

def compress_rag_context(user_query: str, raw_chunks: list[str], similarity_threshold: float = 0.35) -> tuple[str, dict]:
    """
    Evaluates every sentence in the retrieved chunks against the query vector,
    pruning low-relevance filler before sending to the LLM.
    """
    logger = get_logger()
    start_time = time.time()
    
    # 1. Flatten all retrieved chunks into an array of atomic sentences
    all_sentences: list[str] = []
    for chunk in raw_chunks:
        all_sentences.extend(slice_into_sentences(chunk))
        
    if not all_sentences:
        return "", {"original_words": 0, "compressed_words": 0, "reduction_pct": 0}

    # 2. Vectorize the query and all sentences locally in RAM (~8ms)
    query_vector = model.encode(user_query)
    sentence_vectors = model.encode(all_sentences)
    
    # 3. Calculate Cosine Similarity for every sentence simultaneously using NumPy dot product
    # (Since vectors from SentenceTransformer are L2-normalized, dot product == cosine similarity)
    similarities = np.dot(sentence_vectors, query_vector)
    
    # 4. Filter and retain only high-signal sentences
    high_signal_sentences: list[str] = []
    for sentence, score in zip(all_sentences, similarities):
        if score >= similarity_threshold:
            high_signal_sentences.append(sentence)
            
    # Fallback: If threshold is too strict and strips everything, keep top 3 highest scoring sentences
    if not high_signal_sentences:
        top_3_idx = np.argsort(similarities)[-3:]
        high_signal_sentences = [all_sentences[i] for i in sorted(top_3_idx)]

    compressed_context = " ".join(high_signal_sentences)
    
    # 5. Calculate pruning telemetry
    original_word_count = sum(len(s.split()) for s in all_sentences)
    compressed_word_count = len(compressed_context.split())
    reduction = round((1 - (compressed_word_count / max(original_word_count, 1))) * 100, 1)
    
    latency_ms = round((time.time() - start_time) * 1000, 2)
    logger.info(
        "prompt_compression_executed",
        original_words=original_word_count,
        compressed_words=compressed_word_count,
        reduction_pct=reduction,
        latency_ms=latency_ms
    )
    
    metrics = {
        "original_words": original_word_count,
        "compressed_words": compressed_word_count,
        "reduction_pct": reduction,
        "latency_ms": latency_ms
    }
    
    print(f" PRUNED CONTEXT: Reduced payload by {reduction}% ({original_word_count} -> {compressed_word_count} words in {latency_ms}ms)")
    return compressed_context, metrics