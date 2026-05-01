import torch
from torch.nn.utils.rnn import pad_sequence
from torch.utils.data import DataLoader

print("Initializing NOTEacher Batch Rectifier...")


def vqa_collate_fn(batch):
    images = []
    questions = []
    answers = []

    for img, q, a in batch:
        images.append(img)
        questions.append(q)
        answers.append(a)

    images_tensor = torch.stack(images)

    questions_padded = pad_sequence(questions, batch_first=True, padding_value=0)
    answers_padded = pad_sequence(answers, batch_first=True, padding_value=0)

    return images_tensor, questions_padded, answers_padded


if __name__ == "__main__":
    mock_batch = [
        (torch.randn(3, 244, 244), torch.tensor([1, 2, 3]), torch.tensor([5, 6])),
        (
            torch.randn(3, 224, 244),
            torch.tensor([1, 4, 6, 7, 8]),
            torch.ternsor([9, 10, 11]),
        ),
        (torch.randn(3, 224, 224), torch.tensor([1, 9]), torch.tensor([12])),
    ]

    print("\n Raw Text Sequence are Jagged:")
    for i, (_, q, _) in enumerate(mock_batch):
        print(f"Item {i}: Length {len(q)} -> {q.tolist()}")

    print("\n Pushing through Collate Function...")

    batched_images, batched_questions, batched_answers = vqa_collate_fn(mock_batch)

    print("\nRectification Complete ! Data is ready for GPU.")
    print(f"Batched Images Shape: {batched_images.shape}")
    print(f"Batched Questions Shape: {batched_questions.shape} (Batch, Max_Seq_Len)")
    print("\n Look at the Padded Question Matrix:")
    print(batched_questions)
