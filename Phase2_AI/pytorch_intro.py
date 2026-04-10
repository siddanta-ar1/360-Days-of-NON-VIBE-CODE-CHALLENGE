import torch

x = torch.tensor([2.0])
target = torch.tensor([10.0])

weight = torch.tensor([1.0], requires_grad=True)

print("--- STARTING PYTORCH ---")
print(f"Initial Weight: {weight.item()}")

prediction = x * weight
loss = (prediction - target) ** 2

print(f"Prediction: {prediction.item()} | Loss: {loss.item()}")

loss.backward()

print(f"\n The calculated slope (gradient) is: {weight.grad.item()}")

learning_rate = 0.1

with torch.no_grad():
    weight -= learning_rate * weight.grad

print(f"New Adjusted Weight: {weight.item():.2f}")
