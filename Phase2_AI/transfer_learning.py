import torch
import torch.nn as nn
import torchvision.models as models

print("Downloading pre-trained ResNet-18 brain from PyTorch servers...")
model = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)

for param in model.parameters():
    param.requires_grad = False

print("ResNet backbone completely frozen.")

num_features = model.fc.in_features

model.fc = nn.Linear(num_features, 2)
print("Original head removed. Custom 2-Node Head attached!")

total_params = sum(p.numel() for p in model.parameters())
trainable_params = sum(p.numel() for p in model.parameters() if p.requires_grad)

print("--- Surgery Complete ---")
print(f"Total Parameters in Brain: {total_params:,}")
print(f"Parameters we actually have to train : {trainable_params:,}")
print(
    f"Percentage of brain we have to calculate: {(trainable_params / total_params) * 100:.2f}%"
)


fake_color_image = torch.randn(1, 3, 224, 224)
output = model(fake_color_image)

print("Hybrid Brain successfully processed the images!")
print(f"Output Shape: {output.shape} (1 Image, 2 Categ0ries: Cat or Dog)")
