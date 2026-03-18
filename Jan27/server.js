const cluster = require("cluster");
const os = require("os");
const app = require("./app");

const numCPUs = os.cpus().length;

if (cluster.isPrimary) {
  console.log(`Master Process (PID: ${process.pid}) is running. `);
  console.log(`Spinning up ${numCPUs} distinct Node.js servers...\n`);

  for (let i = 0; i < numCPUs; i++) {
    cluster.fork();
  }

  cluster.on("exit", (worker, code, signal) => {
    console.log(`Worker ${worker.process.pid} died. Spawning a replacement...`);
    cluster.fork();
  });
} else {
  const PORT = process.env.PORT || 3000;

  app.listen(PORT, () => {
    console.log(
      `Worker Clone (PID: ${process.pid} is listening on port ${PORT}`,
    );
  });
}
