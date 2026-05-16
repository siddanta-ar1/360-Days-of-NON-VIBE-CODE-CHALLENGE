import time

import numpy as np
import onnxruntime as ort

from Phase2_AI.NOTEacher_VQA.export_onnx import dummy_image
from Phase2_AI.transformer_intro import output

print("Initializing Pure ONNX Runtime Engine...")

onnx_model_path = "noteacher_vqa.onnx"

try:
    session = ort.InferenceSession(onnx_model_path, providers=["CPUExecutionProvider"])
    print("ONNX Session booted successfully.")
except Exception as e:
    print(f"Failed to load {onnx_model_path}. Did you run yesterday's export script?")
    exit()

dummy_image = np.random.randn(1, 3, 224, 224).astype(np.float32)

dummy_text = np.array([[1, 2, 3]], dtype=np.int64)

print("\n Firing ONNX Execution Engine...")
start_time = time.time()

outputs = session.run(
    output_names=None, input_feed={"image_input": dummy_image, "text_input": dummy_text}
)

latency = (time.time() - start_time) * 1000

raw_logits = outputs[0]

last_word_logits = raw_logits[0, -1, :]

predicted_token_id = np.argmax(last_word_logits)

print(f"Inference Latency: {latency:.2f} ms")
print(f"Output Shape: {raw_logits.shape}")
print(f"Predicted Next Token ID: {predicted_token_id}")
print(
    "\nNotice: We just executed a massive Multimodal AI without importing PyTorch once!"
)
