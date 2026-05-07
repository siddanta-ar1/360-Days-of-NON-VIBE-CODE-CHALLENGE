import torch
from model import NOTEacherVQA

print("Powering up the NOTEacher Inference Engine...")

vocab_size = 10000
embed_dim = 256
num_heads = 8

mock_vocab = {
    "<PAD>": 0,
    "<START>": 1,
    "the": 2,
    "answer": 3,
    "is": 4,
    "four": 5,
    "<END>": 6,
}
reverse_vocab = {v: k for k, v in mock_vocab.items()}

model = NOTEacherVQA(vocab_size, embed_dim, num_heads)

try:
    model.load_state_dict(torch.load("noteacher_epoch_3.pth", weights_only=True))
    print("Brain successfully loaded from disk.")
except FileNotFoundError:
    print(
        "No trained brain found. The AI will speak randomly, but the architecture will still function."
    )

model.eval()


def generate_greedy(image_tensor, question_tokens, max_length=10):
    current_sequence = torch.tensor([[1]])
    generated_text = []

    print("\n--- Initiating Autoregressive ---")
    with torch.no_grad():
        for step in range(max_length):
            logits = model(image_tensor, current_sequence)
            next_word_logits = logits[0, -1, :]
            next_word_id = torch.argmax(next_word_logits).item()
            word = reverse_vocab.get(next_word_id, "<UNK>")
            generated_text.append(word)
            print(f"Step {step + 1}: AI chose '{word} (ID: {next_word_id})")
            if next_word_id == 6:
                break

            next_token_tensor = torch.tensor([[next_word_id]])
            current_sequence = torch.cat([current_sequence, next_token_tensor], dim=1)

    return " ".join(generated_text)


if __name__ == "__main__":
    fake_image = torch.randn(1, 3, 224, 224)
    fake_question = torch.tensor([[1, 2, 3]])

    final_answer = generate_greedy(fake_image, fake_question)

    print(f"\n Generation Complete!")
    print(f"Final AI Response: {final_answer}")
