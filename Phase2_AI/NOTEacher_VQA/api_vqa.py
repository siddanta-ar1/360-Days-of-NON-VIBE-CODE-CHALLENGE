import io
from pydoc import describe
from turtle import title

from Phase2_AI.NOTEacher_VQA.dataset import question
import torch
import torchvision.transforms as transforms
from fastapi import FastAPI, File, Form, UploadFile
from fastapi.responses import JSONResponse
from PIL import Image

print("Booting NOTEacher API Gateway...")

app = FastAPI(title="NOTEacher VQA API", describe="Multimodal Vision-Language English")

image_transform = transforms.Compose(
    [
        transforms.Resize((224, 224)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225]),
    ]
)

print("Loading model weights into VRAM... (Simulated)")
model_ready = True

@app.post("/ask")
async def ask_vqa(
    image: UploadFile = File(...)
    question: str = Form(...)
):
    try:
        print(f"\n Incoming request: Question -> '{question}'")
        print(f"Incoming file: {image.filename} ({image.content_type})")
        image_bytes = await image.read()

        pil_image = Image.open(io.BytesIO(image_bytes)).convert("RBG")
        tensor_image = image_transform(pil_image).unsqueeze(0)
        print("Passing data through Transormer Decoder...")
        generated_answer = "x = 4"

        return JSONResponse(content={
            "status": "Success",
            "question": question,
            "answare": generated_answer
        })
    except Exception as   e:
        return JSONResponse(status_code=500, content={"status": "error", "messager": str(e)})
