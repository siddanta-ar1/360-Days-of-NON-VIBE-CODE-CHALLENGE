const express = require("express");
const app = express();
const userController = require("./controllers/userController");
const protect = require("./middleware/authMiddleware");
const upload = require("./middleware/uploadMiddleware");
app.use(express.json());

app.post("/register", userController.register);
app.post("/login", userController.login);
app.get("/profile", protect, userController.getProfile);
app.post(
  "/upload",
  upload.single("profilePic"),
  userController.uploadProfilePic,
);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
