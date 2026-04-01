import math


def sigmoid(x):
    return 1 / (1 + math.exp(-x))


inputs = [1.2, 2.5, 0.8]
weights = [0.5, -0.4, 1.1]
bias = 0.2

raw_sum = sum(i * w for i, w in zip(inputs, weights)) + bias

activated_output = sigmoid(raw_sum)

print("Python Neuron Execution:")
print(f"Raw Dot Product: {raw_sum:.4f}")
print(
    f"Activated Output (Probability): {activated_output:.4f} (or {activated_output * 100:.2f}%)"
)
