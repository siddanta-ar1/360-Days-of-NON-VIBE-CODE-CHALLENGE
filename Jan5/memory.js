function createSmartCalculator(logicFunction) {
  const cache = {};

  return function (input) {
    if (cache[input]) {
      console.log(`[Fast] Found ${input} in memory!`);
      return cache[input];
    }

    console.log(`[Slow] Calculating for ${input}...`);
    const result = logicFunction(input);

    cache[input] = result;
    return result;
  };
}

const slowSquare = (num) => num * num;

const smartSquare = createSmartCalculator(slowSquare);

console.log(smartSquare(5));
console.log(smartSquare(5));
console.log(smartSquare(10));
console.log(smartSquare(5));
