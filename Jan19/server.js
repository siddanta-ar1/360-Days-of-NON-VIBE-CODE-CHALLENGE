const http = require("http");
const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/login") {
    let body = [];

    req.on("data", (chunk) => {
      console.log("Received chunk: ", chunk);
      body.push(chunk);
    });

    req.on("end", () => {
      const parsedBody = Buffer.concat(body).toString();

      console.log("Raw Text:", parsedBody);

      try {
        const jsonData = JSON.parse(parsedBody);
        console.log("User Object:", jsonData);

        res.writeHead(200, {
          "Content-Type": "application/json",
        });
        res.end(
          JSON.stringify({
            message: `Welcome, ${jsonData.name}!`,
          }),
        );
      } catch (e) {
        res.writeHead(400);
        res.end("Invalid JSON");
      }
    });
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(3000, () => {
  console.log("Server listening on port 3000");
});
