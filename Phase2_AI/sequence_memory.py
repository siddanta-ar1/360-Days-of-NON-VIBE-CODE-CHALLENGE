import torch
import torch.nn as nn

seq_length = 5
batch_size = 1
embed_size = 10

dummy_sentence = torch.randn(seq_length, batch_size, embed_size)

print("Initializing Sequence Models...")

hidden_size = 20
rnn = nn.RNN(input_size=embed_size, hidden_size=hidden_size)

lstm = nn.LSTM(input_size=embed_size, hidden_size=hidden_size)

print("\n--- Passing Sentence Through RNN ---")
rnn_out, rnn_hidden = rnn(dummy_sentence)

print(f"RNN Output Shape: {rnn_out.shape}-> (Words, Batch, Hidden Size)")
print(f"RNN Final Memory Shape: {rnn_hidden.shape} -> (Layers, Batch, Hidden Size )")

print("\n--- Passing Sentence Through LSTM ---")
lstm_out, (lstm_hidden, lstm_cell) = lstm(dummy_sentence)

print(f"LSTM Output Shape: {lstm_out.shape}")
print(f"LSTM Final Short-Term Memory Shape: {lstm_hidden.shape}")
print(f"LSTM Final Long-Term Memory (Cell) Shape: {lstm_cell.shape}")
print("\nSequence successfully processed through time.")
