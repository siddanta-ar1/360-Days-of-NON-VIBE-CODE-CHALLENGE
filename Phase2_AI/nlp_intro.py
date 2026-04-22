import torch
import torch.nn as nn

print("Initializing NLP Engine...")

vocab = {"<PAD>": 0, "the": 1, "cat": 2, "dog": 3, "sat": 4, "barked": 5}
reverse_vocab = {v: k for k, v in vocab.items()}

sentence = "the dog barked"
print(f"Raw String: '{sentence}'")

token_ids = [vocab[word] for word in sentence.split()]
input_tensor = torch.tensor([token_ids])

print(f"Token IDs: {input_tensor.tolist()}")

embedding_layer = nn.Embedding(num_embeddings=6, embedding_dim=4)

word_vectors = embedding_layer(input_tensor)

print("\n The Mathematical Meaning (Word Embeddings):")
for i, word_id in enumerate(token_ids):
    word = reverse_vocab[word_id]
    vector = word_vectors[0][i].detach().numpy()
    fomatted_vector = ["{:.4f}".format(x) for x in vector]
    print(f"Word: '{word:<6}' -> Vector: {fomatted_vector}")

print(
    f"\nFinal Tensor Shape: {word_vectors.shape} (Batch, Sequence Length, Embedding Dim)"
)
