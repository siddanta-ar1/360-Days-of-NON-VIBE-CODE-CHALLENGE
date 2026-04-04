from os import error

import numpy as np

targets = np.array([1.0, 0.0, 1.0])
predictions = np.array([0.8, 0.2, 0.4])


def calculate_mse(y_true, y_pred):
    errors = y_true - y_pred
    squared_errors = errors**2
    mean_squared_error = np.mean(squared_errors)
    return mean_squared_error


loss = calculate_mse(targets, predictions)

print("Loss Calculation Complete!")
print(f"Targets: {targets}")
print(f"Predictions: {predictions}")
print(f"Raw Errors: {targets - predictions}")
print(f"\nFinal MSE (The 'Stupidity Score'): {loss:.4f}")
