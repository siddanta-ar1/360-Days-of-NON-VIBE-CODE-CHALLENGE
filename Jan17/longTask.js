process.on("message", (message) => {
  if (message === "start") {
    console.log("Child Process: Starting heavy work...");
    let total = 0;
    for (let i = 0; i < 5e9; i++) {
      total++;
    }
    process.send(total);
  }
});
