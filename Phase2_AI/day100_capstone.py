import numpy as np


def sigmoid(x):
    return 1 / (1 + np.exp(-x))


def sigmoid_derivative(x):
    return x * (1 - x)


X = np.array([[0, 0, 1], [0, 1, 1], [1, 0, 1], [1, 1, 1]])

y = np.array([[0], [0], [1], [1]])

np.random.seed(1)

w1 = 2 * np.random.random((3, 4)) - 1

w2 = 2 * np.random.random((4, 1)) - 1

print("--- STARTING DAY 100 TRAINING (10,000 Epochs) ---")

for epoch in range(1000):
    layer0 = X
    layer1 = sigmoid(np.dot(layer0, w1))
    layer2 = sigmoid(np.dot(layer1, w2))

    layer2_error = y - layer2

    layer2_delta = layer2_error * sigmoid_derivative(layer2)

    layer1_error = layer2_delta.dot(w2.T)

    layer1_delta = layer1_error * sigmoid_derivative(layer1)

    w2 += layer1.T.dot(layer2_delta)
    w1 += layer0.T.dot(layer1_delta)

print("\n--- TRAINING COMPLETE ---")
print("Target Answers:")
print(y)
print("\nAI's Final Predictions:")
print(layer2)
