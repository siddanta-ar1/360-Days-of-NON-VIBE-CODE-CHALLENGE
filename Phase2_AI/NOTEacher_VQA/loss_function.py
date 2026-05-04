import torch
import torch.nn as nn

print("Initializing Sequence Grading System...")

vocab_size = 1000
pad_token_id = 0

criterion = nn.CrossEntropyLoss(ignore_index=pad_token_id)
batch_size = 2
seq_len = 4

logits = torch.tandn(batch_size, seq_len, vocab_size)

targets = torch.tensor([[8, 12, 5, 0], [7, 8, 0, 0]])
print(f"\n Forward Pass Output (Logits): {logits.shape}")

print(f"Ground Truth Targets: {targets.shape}")

logits_flat = logits.view(-1, vocab_size)
targets_flat = targets.view(-1)

print(f"\n Reshaped Logits: {logits_flat.shape} (Total Words, Vocab Size)")
print(f"Reshaped Targets: {targets_flat.shape} (Total Words)")

loss = criterion(logits_flat, targets_flat)

print(f"\n Grading Complted!")
print(f"Total Sequence Loss: {loss.item():.4f}")
print(
    "Notice: The Math engine safely skipped the three '0' tokens in our targets. The error gradient is pure!"
)
