const http = require("http");
const crypto = require("crypto");
const { Socket } = require("dgram");

const server = http.createServer((req, res) => {
  res.writeHead(200);
  res.end("Standard HTTP GET Response");
});

server.on("upgrade", (req, socket) => {
  if (req.headers["upgrade"] !== "websocket") {
    return socket.end("HTTP/1.1 400 Bad Request");
  }

  const clientKey = req.headers["sec-websocket-key"];

  const magicString = "258EAFA5-E914-47DA-95CA-C5AB0DC85B11";

  const acceptKey = crypto
    .createHash("sha1")
    .update(clientKey + magicString)
    .digest("base64");

  const responseHeaders = [
    "HTTP/1.1 101 Switching Protocos",
    "Upgrade: websocket",
    "Connection: Upgrade",
    `Sec-WebSocket-Accept: ${acceptKey}`,
    "\r\n",
  ].join("\r\n");

  socket.write(responseHeaders);

  console.log("The TCP pipe is open! Bidirectional communication achieved.");

  setInterval(() => {
    console.log("Server thinking about pushing data...");
  }, 2000);
});

server.listen(3000, () => console.log("Server listening on port 3000"));
