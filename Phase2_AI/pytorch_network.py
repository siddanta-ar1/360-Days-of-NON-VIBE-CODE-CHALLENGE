import torch
import torch.nn as nn
import torch.optim as optim

X = torch.tensor([[0.0, 0.0, 1.0], [0.0, 1.0, 1.0], [1.0, 0.0, 1.0], [1.0, 1.0, 1.0]])

y = torch.tensor([[0.0], [0.0], [1.0], [1.0]])


class DeepBrain(nn.Module):
    def __init__(self):
        super(DeepBrain, self).__init__()

        self.hidden_layer = nn.Linear(3, 4)
        self.output_layer = nn.Linear(4, 1)

    def forward(self, x):
        x = torch.sigmoid(self.hidden_layer(x))
        x = torch.sigmoid(self.output_layer(x))
        return x


model = DeepBrain()

loss_function = nn.MSELoss()

optimizer = optim.SGD(model.parameters(), lr=1.0)

print("--- Starting Pytorch deep training ---")

for epoch in range(5000):
    optimizer.zero_grad()
    predictions = model(X)
    loss = loss_function(predictions, y)
    loss.backward()
    optimizer.step()

    if epoch % 1000 == 0:
        print(f"Epoch {epoch} | Loss: {loss.item():.4f}")

print("\n--- Training Complete ---")
print("Target Answers:\n", y)
print("\nAI's Final Predictions:\n", model(X).detach())
