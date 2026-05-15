import torch
from model import NOTEacherVQA, embed_dim, num_heads, vocab_size

print("Initiaizing Universal Export Protocol (ONNX)....")

vocab_size = 10000
embed_dim = 256
num_heads = 8

model = NOTEacherVQA(vocab_size, embed_dim, num_heads)

try:
    model.load_state_dict(torch.load("noteacher_epoch_3.pth", weights_only=True))
    model.eval()
    print("PyTorch Brain Loaded.")
except FileNotFoundError:
    print("Couldn't find 'noteacher_epoch_3.pth'. Using empty shell for export test.")
    model.eval()

dummy_image = torch.randn(1, 3, 224, 224)
dummy_text = torch.tensor([[1, 2, 3]])


print("Tracing the neural graph...")

torch.onnx.export(
    model,
    (dummy_image, dummy_text),
    "noteacher_vqa.onnx",
    export_params=True,
    opset_version=17,
    do_constant_folding=True,
    input_names=["image_input", "text_input"],
    output_names=["logits_output"],
    dynamic_axes={
        "image_input": {0: "batch_size"},
        "text_input": {0: "batch_size", 1: "sequence_length"},
        "logits_output": {0: "batch_size", 1: "sequence_length"},
    },
)

print("ONNX Export Complete!")
print(
    "The 'noteacher_vqa.onnx' file can now run in C++, Rust, Javascript, or iOS without PyTorch."
)
