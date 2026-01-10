const fs = require("fs");

console.log("1. Script Start (Main Stack)");

setTimeout(() => {
  console.log("?. setTimeout 1 (0ms)");
}, 0);

setTimeout(() => {
  console.log("?. setTimeout 2 (0ms)");
}, 0);

Promise.resolve()
  .then(() => {
    console.log("?. Promise 1");
  })
  .then(() => {
    console.log("?. Promise 2 (Chained)");
  });

process.nextTick(() => {
  console.log("?. process.nextTick");
});

console.log("2. Script End (Main Stack)");
