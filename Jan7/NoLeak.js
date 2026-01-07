function safeFunction() {
  console.log("\n--- Safe Function Running ---");

  const hugeData = new Array(1000000).fill("Safe Data");

  const used = process.memoryUsage().heapUsed / 1024 / 1024;
  console.log(`Memory Spiked to: ${Math.round(used * 100) / 100} MB`);
}

setInterval(() => {
  safeFunction();
}, 1000);
