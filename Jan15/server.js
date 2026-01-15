const http = require("http");

const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.url}`);

  if (req.url === "/") {
    res.writeHead(200, { "content-Type": "text/plain" });
    res.end("Welcome to the Home Page! hello hi");
  } else if (req.url === "/api/user") {
    const userData = {
      name: "Siddanta",
      day: 14,
      status: "Learning Node Internals",
    };
    res.writeHead(200, { "Content-Type": "application/json" });
    res.end(JSON.stringify(userData));
  } else {
    res.writeHead(404, { "Content-Type": "text/plain" });
    res.end("404: Page not found");
  }
});

server.listen(3000, () => {
  console.log("Server is running on http://localhost:3000");
  console.log("Hello");
});
