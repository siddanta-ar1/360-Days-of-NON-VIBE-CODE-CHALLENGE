// Day 3: The Race Condition

console.log("1. Script Start");
setTimeout(() => {
  console.log("2. setTimeout (macrotask)");
}, 0);

setTimeout(() => {
  Promise.resolve().then(() => {
    console.log("3. Promise (Microtask)");
  });
}, 0);

console.log("4. Script End");
