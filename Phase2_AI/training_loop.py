input_data = 2.0
true_target = 10.0

weight = 1.0
learning_rate = 0.05
epochs = 50

print("--- Starting Training ---")
print(f"Initial Weight: {weight:.4f}\n")

for epoch in range(1, epochs + 1):
    prediction = input_data * weight
    error = prediction - true_target
    mse_loss = error**2

    derivative = 2 * input_data * error
    weight = weight - (learning_rate * derivative)

    if epoch % 10 == 0 or epoch == 1:
        print(
            f"Epoch {epoch:02d} | Loss: {mse_loss:.4f}| Prediction: {prediction:.4f} | Adjusted Weight: {weight:.4f}"
        )

print("\n--- TRAINING COMPLETE ---")
print(f"Final Trained Weight: {weight:.4f}")
print(f"Final Perfect Prediction: {input_data * weight:.4f}")
