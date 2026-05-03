import torch
import torch.nn.functional as F
from attention_mask import create_causal_mask
from data_loader import vqa_collate_fn
from dataset import NOTEacherDataset, mock_database
from model import NOTEacherVQA
from torch.utils.data import DataLoader

print("Booting NOTEacher VQA Engine Test Sequence...")

vocab_size = 10000
embed_dim = 256
num_heads = 8

mock_vocab = {"<PAD>": 0, "solve": 1, "for": 2, "x": 3, "four": 4, "is": 5}
reverse_vocab = {v: k for k, v in mock_vocab.items()}

mock_database = [
    {"image": torch.randn(3, 224, 224), "question": "solve for x", "answer": "four"},
    {"image": torch.randn(3, 224, 224), "question": "what is ", "answer": "x"},
]

dataset = NOTEacherDataset(mock_database, mock_vocab)
dataloader = DataLoader(dataset, batch_size=2, collate_fn=vqa_collate_fn)
model = NOTEacherVQA(vocab_size, embed_dim, num_heads)

print("\n--- INITIATING FORWARD PASS ---")

for batch_idx, (images, questions, answers) in enumerate(dataloader):
    print(f"Loaded Batch {batch_idx + 1}")
    print(f"Images Shape: {images.shape}")
    print(f"Questions Shape: {questions.shape}")

    input_sequence = torch.cat([questions, answers], dim=1)
    seq_length = input_sequence.size(1)

    print(f"Combined Sequence Shape: {input_sequence.shape}")

    mask = create_causal_mask(seq_length).to(images.device)

    try:
        logits = model(images, input_sequence)

        print("Forward Pass Successful!")
        print(f"Logits Shape: {logits.shape} (Batch, Seq_Len, Vocab_Size")

        last_word_logits = logits[0, -1, :]
        predicted_token_id = torch.argmax(last_word_logits).item()

        predicted_word = reverse_vocab.get(predicted_token_id, "<UNKNOWN>")

        print(
            f"\n AI Prediction for last word: Token {predicted_token_id} ('{predicted_word}')"
        )
        print(
            "Note: Because the model is untrained, this prediction is completely random!"
        )

    except Exception as e:
        print(
            "\n The forward Pass executed, but the Model Architecture needs an update to accept the Causal Mask. "
        )
        print(f"Error Details: {e}")

    break
