const http = require("http");
const { fork } = require("child_process");
const path = require("path");

const server = http.createServer((req, res) => {
  if (req.url === "/") {
    res.end("Home Page (Loads Instantly)");
  } else if (req.url === "/heavy") {
    const child = fork(path.join(__dirname, "longTask.js"));
    child.send("start");

    child.on("message", (total) => {
      res.end(`Heavy Calculation Done: ${total}`);
      child.kill();
    });
  }
});

server.listen(3000, () => {
  console.log("Server running on port 3000");
});
