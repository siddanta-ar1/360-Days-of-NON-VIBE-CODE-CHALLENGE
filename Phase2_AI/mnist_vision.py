import matplotlib

matplotlib.use("MacOSX")
import matplotlib.pyplot as plt
import torch
import torchvision
import torchvision.transforms as transforms

transforms = transforms.Compose([transforms.ToTensor()])

print("Downloading MNIST Dataset (This might take a few seconds)...")
train_dataset = torchvision.datasets.MNIST(
    root="./data", train=True, download=True, transform=transforms
)

batch_size = 6
train_loader = torch.utils.data.DataLoader(
    train_dataset, batch_size=batch_size, shuffle=True
)

data_iterator = iter(train_loader)
images, labels = next(data_iterator)

print("Batched Fetched!")
print(f"Image Tensor Shape: {images.shape} (Batch, Channels, Height, Width)")
print(f"Labels Tensor Shape: {labels.shape}")

fig, axes = plt.subplots(1, batch_size, figsize=(12, 3))
for i in range(batch_size):
    image_2d = images[i].squeeze().numpy()
    label = labels[i].item()

    axes[i].imshow(image_2d, cmap="gray")
    axes[i].set_title(f"Label: {label}")
    axes[i].axis("off")

print("Opening visualization window.. (Close the window to end the script)")
plt.show()
