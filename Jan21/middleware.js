const express = require("express");
const app = express();

const loggerMiddleware = (req, res, next) => {
  const method = req.method;
  const url = req.url;
  const time = new Date().toISOString();
  console.log(`[${time}] ${method} ${url}`);
  next();
};
app.use(loggerMiddleware);

const apiKeyMiddleware = (req, res, next) => {
  const apiKey = req.query.key;

  if (apiKey === "123") {
    console.log("Access Granted.");
    next();
  } else {
    console.log("Access Denied.");
    res.status(403).json({ error: "Forbidden: Wrong Key" });
  }
};

app.get("/", (req, res) => {
  res.send("Welcome to the Public Home Page.");
});

app.get("/dashboard", apiKeyMiddleware, (req, res) => {
  res.send("Welcome to the Secret Dashboard! ");
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
