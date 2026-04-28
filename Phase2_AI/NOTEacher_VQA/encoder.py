import torch
import torch.nn as nn
import torchvision.models as models

print("Initializing NOTEacher Vision Encoder...")


class VisionEncoder(nn.Module):
    def __init__(self, embed_dim):
        super().__init__()

        resnet = models.resnet18(weights=models.ResNet18_Weights.DEFAULT)

        # Freeze backbone
        for param in resnet.parameters():
            param.requires_grad = False

        # Remove final classification layer
        modules = list(resnet.children())[:-1]
        self.backbone = nn.Sequential(*modules)

        # Projection layer
        self.projection = nn.Linear(resnet.fc.in_features, embed_dim)

    def forward(self, images):
        features = self.backbone(images)
        features = features.view(features.size(0), -1)
        visual_embedding = self.projection(features)
        return visual_embedding


if __name__ == "__main__":
    transformer_embed_dim = 256
    encoder = VisionEncoder(embed_dim=transformer_embed_dim)

    fake_student_notes = torch.randn(1, 3, 224, 224)

    print("\n Passing student notes through the visual cortex...")
    visual_thoughts = encoder(fake_student_notes)

    print("Extraction Complete!")
    print(f"Visual Embeddign Shape: {visual_thoughts.shape} (Batch, Embed Dim)")
    print(
        "These 256 numbers contain the entire structure meaning of the image, ready for the Transformer."
    )
