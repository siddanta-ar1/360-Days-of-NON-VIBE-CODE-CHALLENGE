import math

import torch
import torch.nn.functional as F

print("Initializing Scaled Dot-Product Attention...")


def calculate_attention(query, key, value):
    d_k = query.size(-1)
    raw_scores = torch.matmul(query, key.transpose(-2, -1)) / math.sqrt(d_k)

    attention_weights = F.softmax(raw_scores, dim=-1)

    contextual_output = torch.matmul(attention_weights, value)
    return contextual_output, attention_weights


sequence_length = 3
embed_dim = 4

torch.manual_seed(42)

Q = torch.rand(1, sequence_length, embed_dim)
K = torch.rand(1, sequence_length, embed_dim)
V = torch.rand(1, sequence_length, embed_dim)

print("\n Running Attention Mechanism ---")
output, weights = calculate_attention(Q, K, V)

print("\nAttention Weights (Percenages):")

print(torch.round(weights[0] * 100) / 100)

print("\n Meaning Successfully Mixed!")
print(f"Final Output Share: {output.shape} (Batch, Words, Embed_Dim)")
