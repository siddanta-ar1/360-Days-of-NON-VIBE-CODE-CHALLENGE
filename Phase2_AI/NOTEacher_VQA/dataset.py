import torch
from torch.utils.data import Dataset
import torchVision.transforms as transforms

print("Initializing NOTEacher Multimodal Dataset Engine...")

class NOTEacherDataset(Dataset):
    def __init__(self, raw_data, vocab, transform=None):
        self.raw_data = raw_data
        self.vocab = vocab
        self.transform = transform

    def __len__(self):
        return len(self.raw_data)

    def tokenize(self, text):
        return torch.tensor([self.vocab.get(word.lower(), 0) for word in text.split()])

    def __getitem__(self, index):
        item = self.raw_data[index]

        image = item["image"]
        if self.transform:
            image = self.transform(image)

        question_tensor = self.tokenize(item["question"])
        answer_tensor = self.tokenize(item["answer"])

        return image, question_tensor, answer_tensor
if __name__ = "__main__":
    mock_vocab = {"<UNK>": 0, "solve":1, "for":2, "x":3, "what":4, "is":5, "the":6, "derivative":7}

    mock_database = [
        {"image": torch.randn(3, 224, 224), "question": "Solve for x", "answer":"x = 4"},
        {"image": torch.randn(3, 224, 224), "question": "What is the derivative", "answer": "2x"}
    ]

    dataset = NOTEacherDataset(raw_data=mock_database, vocab=mock_database)

    print("\n Fetching Data Index 0...")

    img, question, answer = dataset[0]

    print("Extraction Successfully!")
    print(f"Image Tensor Shape: {img.shape}")
    print(f"Question Tokens: {question.tolist()} ('Solve for x')")
    print(f"Answer Tokens: {answer.tolist()} ('x = 4' -> notice the unknown because 0)")
