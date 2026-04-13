import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader, TensorDataset

if torch.backends.mps.is_available():
    device = torch.device("mps")
    print("Apple Silicon GPU detected! Teleporting to MPS...")
elif torch.cuda.is_available():
    device = torch.device("cuda")
    print("NVIDIA GPU detected! Teleporting to CUDA...")
else:
    device = torch.device("cpu")
    print("No GPU detected. Falling back to CPU...")

X_raw = torch.rand(1000, 3)
y_raw = torch.rand(1000, 1)

dataset = TensorDataset(X_raw, y_raw)
conveyor_belt = DataLoader(dataset, batch_size=32, shuffle=True)

model = nn.Sequential(nn.Linear(3, 64), nn.Sigmoid(), nn.Linear(64, 1))

model = model.to(device)

optimizer = optim.SGD(model.parameters(), lr=0.1)
loss_function = nn.MSELoss()

print(f"--- Starting Training on {device.type.upper()}")

for epoch in range(1, 4):
    for batch_X, batch_y in conveyor_belt:
        batch_X = batch_X.to(device)
        batch_y = batch_y.to(device)

        optimizer.zero_grad()
        predictions = model(batch_X)
        loss = loss_function(predictions, batch_y)
        loss.backward()
        optimizer.step()
    print(f"Epoch {epoch} complete on {device.type.upper()}.")

print("\n--- Hardware Test Complete ---")
