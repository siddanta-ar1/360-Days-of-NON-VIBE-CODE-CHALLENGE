const express = require("express");
const app = express();
const userController = require("./controllers/userController");
const protect = require("./middleware/authMiddleware");

app.use(express.json());

app.post("/register", userController.register);
app.post("/login", userController.login);
app.get("/profile", protect, userController.getProfile);
app.listen(3000, () => {
  console.log("Server running on port 3000");
});
