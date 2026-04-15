import torch
import torch.nn as nn


class VisionBrain(nn.Module):
    def __init__(self):
        super().__init__()
        self.conv1 = nn.Conv2d(in_channels=1, out_channels=8, kernel_size=3, padding=1)
        self.pool = nn.MaxPool2d(kernel_size=2, stride=2)

        self.fc1 = nn.Linear(1568, 10)

    def forward(self, x):
        x = self.pool(torch.relu(self.conv1(x)))
        x = x.view(-1, 1568)
        x = self.fc1(x)
        return x


vision_ai = VisionBrain()

fake_image = torch.randn(1, 1, 28, 28)

print("--- Starting Vision Test ---")
print(f"Input Image Shape: {fake_image.shape} (Batch, Channels, H, W)")

predictions = vision_ai(fake_image)

print(f"\nAI's Raw Guess for digits 0 through 9:\n{predictions.detach().numpy()}")
print(f"\nOutput Shape: {predictions.shape} (1 Image, 10 Possible Digits)")
