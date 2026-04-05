import numpy as np

input_data = 2.0
true_target = 10.0
weight = 1.0

learning_rate = 0.1
print("___ Starting state ___")
print(f"Current Weight: {weight:.2f}")

prediction = input_data * weight
error = prediction - true_target
print(f"Prediction: {prediction:.2f} | Error: {error:.2f}")

derivative = 2 * input_data * error
print(f"Calculated Slope (Derivative): {derivative:.2f}")

weight = weight - (learning_rate * derivative)

print("\n--- After 1 step of learning ---")
print(f"New Adjusted Weight: {weight:.2f}")

new_prediction = input_data * weight
print(f"New Prediction: {new_prediction:.2f} (Target is 10.0)")
