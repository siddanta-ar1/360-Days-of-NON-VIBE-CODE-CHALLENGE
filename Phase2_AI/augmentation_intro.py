import os
import urllib.request

import matplotlib.pyplot as plt
import torch
import torchvision.transforms as transforms
from PIL import Image

print("Fetching a simple image...")
url = "https://raw.githubusercontent.com/pytorch/hub/master/images/dog.jpg"
image_path = "sample_dog.jpg"

if not os.path.exists(image_path):
    urllib.request.urlretrieve(url, image_path)

img = Image.open(image_path)

train_transform = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomRotation(degrees=20),
        transforms.ColorJitter(brightness=0.3, contrast=0.3),
        transforms.ToTensor(),
    ]
)

print("Pipeline initialized. Smulating 5 Epochs of Training...")

fig, axes = plt.subplots(1, 5, figsize=(15, 3))

for i in range(5):
    augmented_tensor = train_transform(img)
    image_2d = augmented_tensor.permute(1, 2, 0).numpy()

    axes[i].imshow(image_2d)
    axes[i].set_title(f"Epoch {i + 1}")
    axes[i].axis("off")

print("Saving Data Augmentation Visualizer...")

plt.savefig("augmentation_preview.png", bbox_inches="tight")
print("Done!")
