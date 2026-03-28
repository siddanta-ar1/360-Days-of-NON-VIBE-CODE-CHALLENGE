const Redis = require("ioredis");
const redisPub = new Redis({ host: "127.0.0.1", port: 6379 });

const simulateUserRegistration = async () => {
  console.log(" Server A: Processing new user registration....");

  const newEvent = {
    type: "USER_REGISTERED",
    payload: { email: "newstudent@noteacher.com", timestamp: Data.now() },
  };
  await redisPub.publish("noteacher-global-events", JSON.stringify(newEvent));

  console.log("Server A: Event published to the entire cluster!");

  setTimeout(() => process.exit(0), 500);
};
simulateUserRegistration();
