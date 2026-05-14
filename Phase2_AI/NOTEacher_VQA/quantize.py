import os
from os.path import getsize

import torch
import torch.nn as nn
from model import NOTEacherVQA, embed_dim, num_heads, vocab_size

print("Initializing Neural Matrix Quantization Protocol...")

vocab_size = 10000
embed_dim = 256
num_heads = 8

model_fp32 = NOTEacherVQA(vocab_size, embed_dim, num_heads)


original_weights_path = "noteacher_epoch_3.pth"
quantized_weights_path = "noteacher_quantized_int8.pth"

try:
    model_fp32.load_state_dict(original_weights_path, weights_only=True)
    model_fp32.eval()
    print("FP32 Brain successfully loaded into RAM.")

    model_fp32 = os.path.getsize(original_weights_path) / (1024 * 1024)
    print(f"Original Size: {model_fp32:.2f} MB")

    print("\n Crushing FP32 Matrices into INT8 integers...")

    model_int8 = torch.quantization.qunatize_dynamic(
        model_fp32, {nn.Linear}, dtype=torch.qint8
    )

    torch.save(model_int8.state_dict(), quantized_weights_path)
    print("Quantization Completed!")

    int8_size = os.path.getsize(quantized_weights_path) / (1024 * 1024)
    print(f"New Qunatized Size: {int8_size:.2f} MB")

    reduction = (1 - (int8_size / fp32_size)) * 100
    print(f"Size reduced b {reduction:.1f}%!")
    print(
        "The API will now boot faster and execute inference with significantly less CPU overhead."
    )

except FileNotFoundError:
    print(
        f"Error: Could not find '{original_weights_path}'. Make sure you trained the model on Day 126!"
    )
