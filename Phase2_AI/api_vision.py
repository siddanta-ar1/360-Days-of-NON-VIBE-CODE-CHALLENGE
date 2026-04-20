import io

import torch
import torch.nn as nn
import torch.nn.functional as F
import torchvision.models as models
import torchvision.transforms as transforms
import uvicorn
from fastapi import FastAPI, File, UploadFile
from PIL import Image

app = FastAPI(title="Vision AI Engine")

print("Booting up AI Core... Loading model into RAM.")
device = torch.device("mps" if torch.backends.mps.is_available() else "cpu")

model = models.resnet18(weights=None)
model.fc = nn.Linear(model.fc.in_features, 2)

try:
    model.load_state_dict(torch.load("vision_brain.pth", map_location=device))
    print("Saved Brain loaded successfully!")
except:
    print("No saved brain found. Using untrained weights for testing.")

model = model.to(device)
model.eval()

transform = transforms.Compose([transforms.Resize((224, 224)), transforms.ToTensor()])


@app.post("/predict")
async def predict_image(file: UploadFile = File(...)):
    image_bytes = await file.read()
    image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
    tensor = transform(image).unsqueeze(0).to(device)

    with torch.no_grad():
        logits = model(tensor)
        probabilities = F.softmax(logits, dim=1)
        confidence, predictions_idx = torch.max(probabilities, 1)

        categories = ["Cat", "Dog"]
        result_class = categories[prediction_idx.item()]
        confidence_score = round(confidence.item() * 100, 2)

        return {
            "filename": file.filename,
            "prediction": result_class,
            "confidence_percentage": confidence_score,
        }


if __name__ == "__main__":
    print("Starting API Server on Port 8000....")
    uvicorn.run(app, host="0.0.0.0", port=8000)
