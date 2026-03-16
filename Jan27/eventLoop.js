console.log("Step 1: I am standard Synchronous code on the Call Stack. ");

setTimeout(() => {
  console.log("Step 5: I am a Macrotask (setTimeout)>.");
}, 0);

Promise.resolve().then(() => {
  console.log("Step 4: I am a standard Microtask (Promise).");
});

process.nextTick(() => {
  console.log("Step 3: I am a high-priority Microtask (process.nextTick).");
});

console.log("Step 2: I am also standard Synchronous code on the Call Stack.");
