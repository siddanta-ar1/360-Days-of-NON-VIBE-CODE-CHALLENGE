console.log("1. Script Start");

setTimeout(() => {
  console.log("2. setTime");
}, 0);

Promise.resolve()
  .then(() => {
    console.log("3. Promise 1");
  })
  .then(() => {
    console.log("4. Promise 2");
  });

console.log("5. Script End");
