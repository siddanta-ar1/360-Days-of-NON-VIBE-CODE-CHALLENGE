const express = require("express");
const app = express();

app.use(express.json());

app.get("/broken", (req, res, next) => {
  const error = new Error("Something broke in the code !");
  error.status = 500;
  next(error);
});

app.get("/", (req, res) => {
  res.send("Everything is fine here.");
});

app.use((req, res, next) => {
  const error = new Error("Route Not Found");
  error.status = 404;
  next(error);
});

app.use((err, req, res, next) => {
  console.error(`[Error] ${err.message}`);
  const statusCode = err.status || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: err.stack,
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
