const http = require("http");

const server = http.createServer((req, res) => {
  console.log("Request received!");
  res.setHeader("Access-Control-Allow-Origin", "*");
  const data = { message: "Secret Data from the Server" };

  res.writeHead(200, { message: "Secret Data from the Server" });
  res.end(JSON.stringify(data));
});

server.listen(3000, () => {
  console.log("API running on http://localhost:3000");
});
