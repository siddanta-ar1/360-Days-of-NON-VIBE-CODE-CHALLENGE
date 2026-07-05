# vision_agent.py
import base64
import os
from fastapi import APIRouter, UploadFile, File, HTTPException
from openai import AsyncOpenAI

router = APIRouter()
client = AsyncOpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

@router.post("/api/vision/analyze")
async def analyze_handwritten_math(file: UploadFile = File(...)):
    # 1. VALIDATE INCOMING PAYLOAD
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Volatile payload: File must be a valid image format.")

    try:
      # 2. READ FILE CHUNKS INTO AN EPHEMERAL BUFFER
      image_bytes = await file.read()
      
      # Convert binary directly into a standard base64 data URL string for OpenAI ingestion
      base64_image = base64.b64encode(image_bytes).decode("utf-8")
      mime_type = file.content_type

      # 3. CONTEXT EXTRACT INFERENCE
      # We command gpt-4o to parse spatial assets and force strict LaTeX formatting rules
      response = await client.chat.completions.create(
          model="gpt-4o",
          messages=[
              {
                  "role": "system",
                  "content": (
                      "You are a Multi-Modal OCR engine specializing in mathematics. "
                      "Extract all handwritten or printed text and equations from the image. "
                      "Convert all mathematical structures into perfect LaTeX format wrapped in standard delimiters "
                      "like $$ for block text and $ for inline statements. Maintain absolute layout logic."
                  )
              },
              {
                  "role": "user",
                  "content": [
                      {"type": "text", "text": "Analyze and extract this mathematical structure:"},
                      {
                          "type": "image_url",
                          "image_url": {"url": f"data:{mime_type};base64,{base64_image}"}
                      }
                  ]
              }
          ],
          max_tokens=1000
      )

      return {"analysis": response.choices[0].message.content}

    except Exception as e:
        print(f" Vision Pipeline Failure: {str(e)}")
        raise HTTPException(status_code=500, detail="Internal processing crash during spatial inference.")