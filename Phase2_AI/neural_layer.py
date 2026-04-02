inputs = [1.0, 2.0, 3.0, 2.5]

weights = [[0.2, 0.8, -0.5, 1.0], [0.5, -0.91, 0.26, -0.5], [-0.26, -0.27, 0.17, 0.87]]

biases = [2.0, 3.0, 0.5]


def calculate_layer(inputs_vector, weight_matrix, bias_vector):
    layer_outputs = []

    for neuron_weights, neuron_bias in zip(weight_matrix, bias_vector):
        neuron_output = 0
        for n_input, weight in zip(inputs_vector, neuron_weights):
            neuron_output += n_input * weight

        neuron_output += neuron_bias
        layer_outputs.append(neuron_output)

    return layer_outputs


outputs = calculate_layer(inputs, weights, biases)

print("Neural Layer Execution Completed !")
print(f"Neuron 1 Output: {outputs[0]:.4f}")
print(f"Neuron 2 Output: {outputs[1]:.4f}")
print(f"Neuron 3 Output: {outputs[2]:.4f}")
print(f"\nFinal Layer Output Vector: {outputs}")
