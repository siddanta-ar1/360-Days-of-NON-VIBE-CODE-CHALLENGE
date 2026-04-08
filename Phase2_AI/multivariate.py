import numpy as np

X = np.array([1.2, 3.0, 0.5])
true_target = 50.0

weights = np.array([0.5, 0.5, 0.5])

learning_rate = 0.01
epochs = 150

print("--- STARTING MULTIVARIATE TRAINING ---")
print(f"Initial Weights: {weights}\n")

for epoch in range(1, epochs + 1):
    prediction = np.dot(X, weights)
    error = prediction - true_target
    mse_loss = error**2

    gradients = 2 * X * error

    weights = weights - (learning_rate * gradients)

    if epoch % 30 == 0 or epoch == 1:
        print(
            f"Epoch {epoch:03d} | Loss: {mse_loss:8.4f} | Prediction: {prediction:8.4f}"
        )

print("--- Training Complete ---")
print(f"Final Weights: {weights}")
print(f"Final Prediction: {np.dot(X, weights):.4f} (Target is {true_target})")
