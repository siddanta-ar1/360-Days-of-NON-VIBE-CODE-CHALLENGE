import matplotlib.pyplot as plt
import torch
import torch.nn as nn
import torch.nn.functional as F
import torch.optim as optim
import torchvision
import torchvision.transforms as transforms


class VisionBrain(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(1, 8, kernel_size=3, padding=1)
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2)
        self.fc1 = nn.Linear(8 * 14 * 14, 10)

    def forward(self, x):
        x = self.pool(torch.relu(self.conv1(x)))
        x = x.view(-1, 8 * 14 * 14)
        return self.fc1(x)


device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")
transform = transforms.ToTensor()

train_loader = torch.utils.data.DataLoader(
    torchvision.datasets.MNIST(
        root="./data", train=True, download=True, transform=transform
    ),
    batch_size=64,
    shuffle=True,
)
test_loader = torch.utils.data.DataLoader(
    torchvision.datasets.MNIST(
        root="./data", train=False, download=True, transform=transform
    ),
    batch_size=6,
    shuffle=True,
)

model = VisionBrain().to(device)
optimizer = optim.Adam(model.parameters(), lr=0.005)

print("Training Brain for 1 minute so it can see...")
model.train()
for images, labels in train_loader:
    optimizer.zero_grad()
    loss = F.cross_entropy(model(images.to(device)), labels.to(device))
    loss.backward()
    optimizer.step()

print("\n🔍 Fetching unseen images and extracting thoughts...")
model.eval()
data_iterator = iter(test_loader)
images, labels = next(data_iterator)

with torch.no_grad():
    raw_logits = model(images.to(device))

    probabilities = F.softmax(raw_logits, dim=1)

    confidence_scores, predictions = torch.max(probabilities, 1)

fig, axes = plt.subplots(2, 3, figsize=(10, 6))  # 2 rows, 3 columns
axes = axes.flatten()

for i in range(6):
    image_2d = images[i].squeeze().cpu().numpy()

    true_label = labels[i].item()
    ai_guess = predictions[i].item()
    confidence = confidence_scores[i].item() * 100

    axes[i].imshow(image_2d, cmap="gray")
    axes[i].axis("off")

    color = "green" if ai_guess == true_label else "red"
    axes[i].set_title(
        f"AI Guess: {ai_guess} ({confidence:.1f}%)\nTruth: {true_label}", color=color
    )

print(" Opening visualizer...")
plt.tight_layout()
plt.show()
