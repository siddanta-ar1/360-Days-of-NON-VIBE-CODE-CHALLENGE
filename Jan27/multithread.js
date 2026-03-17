const {
  Worker,
  isMainThread,
  parentPort,
  workerData,
} = require("worker_threads");

if (isMainThread) {
  console.log("Boss: The server is running and taking requests...");

  const worker = new Worker(__filename, {
    workerData: { loops: 5_000_000_000 },
  });

  worker.on("message", (result) => {
    console.log(`Boss: The worker finished the heavy math! Result: ${result}`);
  });

  setInterval(() => {
    console.log("Boss: I am still responsive and handling other users!");
  }, 500);
} else {
  console.log("Worker: I am on a separate CPU core. Starting heavy math...");
  let count = 0;

  for (let i = 0; i < workerData.loops; i++) {
    count++;
  }

  parentPort.postMessage(count);
}
