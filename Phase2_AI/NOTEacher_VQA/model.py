import torch
import torch.nn as nn
from encoder import VisionEncoder
from decoder import VQADecoderBlock

print("Assembly End-to-End NOTEacher VQA Engine...")

class NOTEacherVQA(nn.Module):
    def __init__(self, vocab_size, embed_dim, num_heads, max_seq_length=50):
        super().__init__()
        self.vision_encoder = VisionEncoder(embed_dim)
        self.text_embedding = nn.Embedding(vocab_size, embed_dim)
        self.position_embedding = nn.Embedding(max_seq_length, embed_dim)

        self.decoder = VQADecoderBlock(embed_dim, num_heads)

        self.fc_out = nn.Linear(embed_dim, vocab_size)

    def forward(self, images, text_tokens):
        visual_features = self.vision_encoder(images)
        visual_features = visual_features.unsqueeze(1)

        batch_size, seq_len = text_tokens.size()
        positions = torch.arange(0, seq_len).unsqueeze(0).to(text_tokens.device)

        text_features = self.text_embedding(text_tokens) + self.position_embedding(positions)

        fused_output = self.decoder(text_features, visual_features)

        logits = self.fc_out(fused_output)
        return logits

if __name__ = "__main__":
    vocab_size = 10000
    embed_dim = 256
    num_heads = 8

    model = NOTEacherVQA(vocab_size=vocab_size, embed_dim=embed_dim, num_heads=num_heads)
    fake_image = torch.randn(1, 3, 224, 224)
    fake_question = torch.tensor([[5, 84, 112, 12]])

    print("\n Firing Master Forward Pass...")
    prediction = model(fake_image, fake_question)

    print("System Architecture Stable!")
    print(f"Final Output Shape: {predictions.shape} (Batch, Seq_len, Vocab_Size)")
    print("The AI has successfully evaluated the image and generated a 10,000-node probability distribution for the next word!")
