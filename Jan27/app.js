const express = require("express");
const app = express();
const userController = require("./controllers/userController");

app.use(express.json());

app.post("/register", userController.register);
app.post("/login", userController.login);
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
