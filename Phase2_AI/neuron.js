const inputs = [1.2, 2.5, 0.8];

const weights = [0.5, -0.4, 1.1];

const bias = 0.2;

const calculateNeuronOutput = (inputArray, weightArray, b) => {
  if (inputArray.length !== weightArray.length) {
    throw new Error(
      "Mathematical Impossibility: Inputs and Weights must be the same lenght.",
    );
  }

  let sum = 0;

  for (let i = 0; i < inputArray.length; i++) {
    sum += inputArray[i] * weightArray[i];
  }
  return sum + b;
};

const output = calculateNeuronOutput(inputs, weights, bias);

console.log(`Neuron Calculation Complete!`);
console.log(`Raw Output Value: ${output}`);
