import torch
import torch.nn as nn

print("Initializing Transformer Architecture...")


class TransformerBlock(nn.Module):
    # FIX 1: Changed __int__ to __init__
    def __init__(self, embed_dim, num_heads):
        super().__init__()
        self.attention = nn.MultiheadAttention(embed_dim, num_heads, batch_first=True)

        self.feed_forward = nn.Sequential(
            nn.Linear(embed_dim, embed_dim * 4),
            nn.ReLU(),
            nn.Linear(embed_dim * 4, embed_dim),
        )

        self.norm1 = nn.LayerNorm(embed_dim)
        self.norm2 = nn.LayerNorm(embed_dim)

    def forward(self, x):
        attention_output, _ = self.attention(query=x, key=x, value=x)

        x = self.norm1(attention_output + x)
        ff_output = self.feed_forward(x)

        x = self.norm2(ff_output + x)
        return x


batch_size = 1
seq_length = 5
embed_dim = 16
num_heads = 4

dummy_sentence = torch.randn(batch_size, seq_length, embed_dim)
print(f"\nInput Sentence Shape: {dummy_sentence.shape} (Batch, Words, Embed Dim)")

gpt_block = TransformerBlock(embed_dim=embed_dim, num_heads=num_heads)

print("Passing data through the Transformer Block....")

output = gpt_block(dummy_sentence)

print(f"Output Sentence Shape: {output.shape} (Batch, Words, Embed Dim)")
