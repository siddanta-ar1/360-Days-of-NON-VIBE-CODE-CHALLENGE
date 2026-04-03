import numpy as np

inputs = np.array([1.0, 2.0, 3.0, 2.5])

weights = np.array(
    [[0.2, 0.8, -0.5, 1.0], [0.5, -0.91, 0.26, -0.5], [-0.26, -0.27, 0.17, 0.87]]
)

biases = np.array([2.0, 3.0, 0.5])

layer_outputs = np.dot(weights, inputs) + biases

print("NumPy Accelerated Execution Complete!")
print(f"Final Layer Output Vector: {layer_outputs}")
