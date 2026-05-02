import torch
import torch.nn.functional as F

print("Initializing Causal Attention Mask...")


def create_causal_mask(sequence_length):
    ones_matrix = torch.ones(sequence_length, sequence_length)

    tril_matrix = torch.tril(ones_matrix)

    mask = tril_matrix == 1
    return mask


if __name__ == "__main__":
    seq_len = 4
    causal_mask = create_causal_mask(seq_len)
    print("'n Step 1: The Causal Mask (True = Can See, False = Blinded)")
    print(causal_mask)

    raw_attention_scores = torch.randn(seq_len, seq_len)

    print("\n Step 2: Raw Attention Scores (Notice it is looking everywhere !)")
    print(torch.round(raw_attention_scores * 10) / 10)

    masked_scores = raw_attention_scores.masked_fill(
        causal_mask == False, float("-inf")
    )

    print("\n Step 3: Masked Scores (The future is replaced wit -Infinity)")
    print(torch.round(masked_scores * 10) / 10)

    final_probabilities = F.softmax(masked_scores, dim=-1)

    print("\n Step 4: Final Attention Probability (Softmax)")
    print(torch.round(final_probabilities * 100) / 100)
    print(
        "\nNotice the top right triangle is entirely 0.00! Word 1 cannot see Word 2. Word 2 cannot see Word 3. The AI can no longer cheat. "
    )
