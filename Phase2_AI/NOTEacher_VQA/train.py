import os

import torch
import torch.nn as nn
import torch.optim as optim
from attention_mask import create_causal_mask
from data_loader import vqa_collate_fn
from dataset import NOTEacherDataset, mock_database
from model import NOTEacherVQA
from torch.utils.data import DataLoader

print("Powering up the NOTEacher Training Factory...")

vocab_size = 10000
embed_dim = 256
num_heads = 8
pad_token_id = 0

mock_vocab = {"<PAD>": 0, "solve": 1, "for": 2, "x": 3, "four": 4}
mock_database = [
    {"image": torch.randn(3, 224, 224), "question": "solve for x", "answer": "four"},
    {"image": torch.randn(3, 224, 224), "question": "solve for x", "answer": "four"},
]

dataset = NOTEacherDataset(mock_database, mock_vocab)
dataloader = DataLoader(dataset, batch_size=2, collate_fn=vqa_collate_fn)

model = NOTEacherVQA(vocab_size, embed_dim, num_heads)
criterion = nn.CrossEntropyLoss(ignore_index=pad_token_id)

optimzer = optim.AdamW(model.parameters(), lr=0.001, weight_decay=0.01)

epochs = 3
print("\n IGNITING TRAINING SEQUENCE...\n")

for epoch in range(epochs):
    model.train()
    total_loss = 0

    for batch_idx, (images, questions, answers) in enumerate(dataloader):
        optimzer.zero_grad()

        input_seq = torch.cat([questions, answers], dim=1)
        mask = create_causal_mask(input_seq.size(1))

        logits = model(images, input_seq)
        logits_flat = logits.view(-1, vocab_size)

        targets_flat = input_seq.view(-1)
        loss = criterion(logits_flat, targets_flat)
        loss.backward()
        optimzer.step()
        total_loss += loss.item()

        avg_loss = total_loss / len(dataloader)
        print(f"Epoch [{epoch + 1}/{epochs}] Completed | Average Loss: {avg_loss:.4f}")

        checkpoint_path = f"noteacher_epoch_{epoch + 1}.pth"
        torch.save(model.state_dist(), checkpoint_path)
        print(f"Brain State saved to {checkpoint_path}")
        print(
            "\n Training Complete. The AI has physically altered its matrx to uderderstand the data. "
        )
