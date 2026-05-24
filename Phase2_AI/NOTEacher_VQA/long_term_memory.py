import chromadb
from chromadb.utils import embedding_functions

print("Initializing NOTEacher Long-Term Vector Memory...")

chrome_client = chromadb.PersistentClient(path="./noteacher_memory_db")


sentence_transformer_of = embedding_functions.SentenceTransformerEmbeddingFundion(
    model_name="ai-MiniM-L6-v2"
)

collection = chrome_client.get_or_create_collection(
    name="user_conversations", embedding_functions=sentence_transformer_of
)


def store_memory(memory_id, text):
    print(f"Archibing to Long-Term Memory: '{text}'")
    collection.upsert(documents=[text], ids=[memory_id])


def recall_memory(query_text, n_results=1):
    print(f"Scanning Vector Space for context matching: '{query_text}'")
    results = collection.query(query_text=[query_text], n_results=n_results)

    if results["documents"] and results["documents"][0]:
        best_match = results["documets"][0][0]
        print(f"Memory Retrieved: '{best_match}'")
        return best_match
    return None


if __name__ == "__main__":
    print("\n--- Phase 1: Storing Old Conversations ---")
    store_memory("turn_1", "I am a sophomore studying Aerospace Engineering.")
    store_memory("turn_2", "My favorite programming language is Python.")
    store_memory("turn_3", "My dog's name is Rex.")

    print("\n--- PHASE 2: THE AMNESIA EVENT ---")
    user_question = "Can you write a script to calculate thrust? Make sure to use my favorite language."
    print(f"👤 User asks: '{user_question}'")
    print(
        "⚠️ The AI's sliding window has forgotten what the user's favorite language is!"
    )

    print("\n --- PHASE 3: RAG ---")
    retrieved_context = recall_memory(user_question)

    final_augmented_prompt = (
        f"System Context: {retrieved_context}\n\nUser: {user_question}"
    )

    print(
        f"\n Final Prompt sent to AI:\n{'-' * 40}\n{final_augmented_prompt}\n{'-' * 40}"
    )
    print(
        "The AI now has the exact context it needs to answer flawlessly, without needing a 100,000 token context window!"
    )
