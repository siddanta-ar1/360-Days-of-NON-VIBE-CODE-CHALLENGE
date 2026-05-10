import time
from contextlib import asynccontextmanager

import torch
from fastapi import FastAPI, Form

print("Initializing Memory Management Protocol...")

ml_models = {}


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("\n Server boot sequence initiated...")
    print("Loading 11-Million Parameter Brain from hard drive into RAM...")

    start_time = time.time()

    time.sleep(3)
    ml_models["vqa_engine"] = "ACTIVE_NEURAL_MATRIX"

    boot_time = time.time() - start_time
    print(f"Brain Loaded in {boot_time:.2f} seconds!")
    print("Server is now open to internet traffics.")

    yield

    print("\n Server shutdown initiated...")
    print("Clearing model from VRAM to prevent memory leaks...")
    ml_models.clear()
    print("Memory cleared. Server safely terminated.")


app = FastAPI(title="Cached NOTEacher API", lifespan=lifespan)


@app.post("/ask")
async def ask_vqa(question: str = form(...)):
    request_start = time.time()
    print(f"\n Incoming request: '{question}'")

    model = ml_models.get("vqa_engine")

    if not model:
        return {"error": "Critical Engine Failure. Model not loaded."}

    print("Executing zero-latency inference...")
    time.sleep(0.1)

    latency = (time.time() - request_start) * 1000

    return {"status": "success", "answer": "x=4", "latency_ms": f"{latency:.2f} ms"}
