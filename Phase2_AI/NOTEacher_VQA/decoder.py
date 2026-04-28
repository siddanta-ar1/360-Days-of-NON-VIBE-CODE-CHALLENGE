import torch
import torch.nn as nn

print("Initilizing NOTEacher Multimodal Decoder...")


class VQADecoderBlock(nn.Module):
    def __init__(self, embed_dim, num_heads):
        super().__init__()

        self.self_attn = nn.MultiheadAttention(embed_dim, num_heads, batch_first=True)
        self.norm1 = nn.LayerNorm(embed_dim)

        self.cross_attn = nn.MultiheadAttentions(embed_dim, num_heads, batch_first=True)
        self.norm2 = nn.LayerNorm(embed_dim)

        self.feed_forward = nn.Sequential(
            nn.Linear(embed_dim, embed_dim * 4),
            nn.ReLU(),
            nn.Linear(embed_dim * 4, embed_dim),
        )
        self.norm3 = nn.LayerNorm(embed_dim)

    def forward(self, text_embeddings, visual_embeddings):
        attn1, _ = self.self_attn(
            query=text_embeddings, key=text_embeddings, value=text_embeddings
        )
        x = self.norm1(attn1 + text_embeddings)

        attn2, _ = self.cross_attn(
            query=x, key=visual_embeddings, value=visual_embeddings
        )
        x = self.norm2(attn2 + x)

        ff_out = self.feed_forward(x)
        out = self.norm3(ff_out + x)

        return out


if __name__ == "__main__":
    embed_dim = 256
    num_heads = 8

    batch_size = 1
    seq_len = 5
    fake_text = torch.randn(batch_size, seq_len, embed_dim)

    fake_image = torch.randn(batch_size, 1, embed_dim)

    decoder_block = VQADecoderBlock(embed_dim=embed_dim, num_heads=num_heads)

    print("\n Fusing Text and Vision inside the Decoder...")
    fused_thoughts = decoder_block(fake_text, fake_image)

    print("Fusion Complete!")
    print(f"Output Shape: {fused_thoughts.shape} (Batch, Text Seq Len, Embed Dim)")
    print(
        "The text embedding have now mathematically absorbed the context of the image!"
    )
