input_data = 2.0
true_target = 10.0

weight = 1.0
learning_rate = 0.28
epochs = 10

print(f"--- Starting training (Learning Rate: {learning_rate} ---")

for epoch in range(1, epochs + 1):
    prediction = input_data * weight
    error = prediction - true_target
    mse_loss = error**2

    derivative = 2 * input_data * error
    weight = weight - (learning_rate * derivative)
    print(
        f"Epoch {epoch:02d} | Loss: {mse_loss:15.4f} | Prediction: {prediction:8.4f} | Weight: {weight:8.4f}"
    )

print("\n Did the Loss go down to 0, or did it explode to Infinity?")
