import torch
import torch.nn as nn
import torch.opim as optim
from torch.utils.data import DataLoader, TensorDataset

X = torch.rand(10, 3)
y = torch.rand(10, 1)

dataset = TensorDataset(X, y)

conveyor_belt = DataLoader(dataset, batch_size=2, shuffle=True)

model = nn.Sequential(nn.Linear(3, 4), nn.Sigmoid(), nn.Linear(4, 1))

optimizer = optim.SDG(model.parameters(), lr=0.1)
loss_function = nn.MSELoss()

print("--- Starting Batch Training ---")
epochs = 3

for epoch in range(1, epochs + 1):
    print(f"\n[ Epoch {epoch} Begins ]")

    batch_number = 1
    for batch_X, batch_y in conveyor_belt:
        optimizer.zero_grad()
        predictions = model(batch_X)
        loss = loss_function(predictions, batch_y)
        loss.backward()
        optimizer.step()
        print(f"Processed Batch {batch_number}/5 | Loss: {loss.item():.4f}")
        batch_number += 1

print("\n--- Taining Complete ---")
