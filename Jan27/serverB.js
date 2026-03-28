const Redis = require("ioredis");
const redisSub = new Redis({ host: "127.0.0.1", port: 6379 });
console.log("Server B is online. Tuning into the global event channel...");

redisSub.subscribe("noteacher-global-events", (err, count) => {
  if (err) console.error("Failed to subscribe:", err.message);
  else
    console.log(`Subscribed successfully! Listening to ${count} channel(s).`);
});

redisSub.on("message", (channel, message) => {
  const event = JSON.parse(message);

  if (channel === "noteacher-global-events") {
    console.log("\n[BROADCARST RECEIVED on Server B]");
    console.log(`Type: ${event.type}`);
    console.log(`Data:`, event.payload);
  }
});
