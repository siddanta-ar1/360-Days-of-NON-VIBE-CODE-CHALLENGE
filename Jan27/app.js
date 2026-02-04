const express = require("express");
const app = express();
const userController = require("./controllers/userController");
const protect = require("./middleware/authMiddleware");
const upload = require("./middleware/uploadMiddleware");
const path = require("path");
const postController = require("./controllers/postController");
app.use(express.json());

app.post("/register", userController.register);
app.post("/login", userController.login);
app.get("/profile", protect, userController.getProfile);
app.post(
  "/upload",
  protect,
  upload.single("profilePic"),
  userController.uploadProfilePic,
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.post("/posts", protect, postController.createPost);
app.get("/posts", postController.getAllPosts);

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
