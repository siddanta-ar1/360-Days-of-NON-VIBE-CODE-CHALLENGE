const EventEmitter = require("events");

const ticketSystem = new EventEmitter();

ticketSystem.on("buy", (person, price) => {
  console.log("--- New Ticket Sold ---");
  console.log(`Customer: ${person}`);
  console.log(`Price: $${price}`);
  console.log(`Email sent to ${person}@gmail.com`);
});

ticketSystem.on("buy", () => {
  console.log("Update Database: Sales + 1");
});

ticketSystem.on("error", (error) => {
  console.log(`Payment Failed ${error}`);
});

console.log("System listening for purchases...");
ticketSystem.emit("buy", "Siddanta", 99);

console.log("\n...waiting...");

ticketSystem.emit("buy", "Elon Musk", 9999);

ticketSystem.emit("error", "Enter price");
