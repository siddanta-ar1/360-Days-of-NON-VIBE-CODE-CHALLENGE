const memoryLeak = [];

function printMemory() {
  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`Current Memory: ${Math.round(used * 100) / 100} MB`);
}

function startLeaking() {
  console.log("---Starting Leak ---");

  setInterval(() => {
    for (let i = 0; i < 10000; i++) {
      memoryLeak.push({ data: Array(1000).fill("x") });
    }
    printMemory();
  }, 500);
}
startLeaking();
