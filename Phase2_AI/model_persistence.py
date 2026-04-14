import os

import torch
import torch.nn as nn


class DeepBrain(nn.Module):
    def __init__(self):
        super().__init__()
        self.hidden = nn.Linear(3, 4)
        self.output = nn.Linear(4, 1)


model_A = DeepBrain()
with torch.no_grad():
    model_A.hidden.weight[0][0] = 99.9

print("--- MODEL A (Before Save) ---")
print(f"Tracking Weight: {model_A.hidden.weight[0][0].item():.2f}")

save_path = "noteacher_brain.pth"
torch.save(model_A.state_dict(), save_path)
print(f"\n Snapshot saved! Wrote {os.path.getsize(save_path)} bytes to {save_path}")

model_B = DeepBrain()

print("\n --- Model B (brand new) ---")
print(f"Tracking Weight: {model_B.hidden.weight[0][0].item():.2f} (Random  Garbage)")

loaded_memories = torch.load(save_path, weights_only=True)
model_B.load_state_dict(loaded_memories)

print("\n--- MODEL B (After Injection) ---")
print(f"Tracking Weight: {model_B.hidden.weight[0][0].item():.2f} (Memories Restored!)")
