import matplotlib.pyplot as plt
import numpy as np
import torch
import torch.nn.functional as F

print("Initializing NOTEacher Interpretability X-Ray...")

def plot_attention_heatmap(image_tensor, attention_weights,word, save_path="heatmap.png" ):
        img = image_tensor.squeeze(0).permute(1,2,0).numpy()

        img = (img - img.min()) / (img.max() - img.min())

        grid_size = int(np.sqrt(attention_weights.size(1)))

        attention_grid = attention_weights.view(1, 1, grid_size, grid_size)

        attention_upscaled = F.interpolate(
            attention_grid,
            size=(img.shape[0], img.shape[1]),
            mode='bilinear',
            align_corners=False
        ).squeeze().numpy()

        fig, ax = plt.subplots(1, 2, figsize=(10, 5))

        ax[0].imshow(img)
        im = ax[1].imshow(attention_upscaled, cmap='jet', alpha=0.5)
        ax[1].set_title(f"AI Focus when typing: '{word}'")
        ax[1].axis('off')

        plt.colorbar(im, ax=ax[1], fraction=0.046, pad=0.04)

        plt.tight_layout()
        plt.savefig(save_path)
        print(f"\n Heatmap successfully generated and saved to '{save_path}'")

    if __name__ == "__main__":
        fake_image = torch.rand(1, 3, 224, 224)

        fake_attention_weight = torch.rand(1, 49) * 0.1
        fake_attention_weight[0, 24] = 0.95

        target_word = "x"
        print(f"\n Extractign spatial cross-attention for token: '{target_word}'...")
        plot_attention_heatmap(fake_image, fake_attention_weight, target_word )
