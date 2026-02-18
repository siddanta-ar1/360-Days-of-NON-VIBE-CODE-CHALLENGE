const express = require("express");
const helmet = require("helmet");
const app = express();
const { globalLimiter } = require("./middleware/limiter");
const logger = require("./utils/logger");
const userController = require("./controllers/userController");
const protect = require("./middleware/authMiddleware");
const upload = require("./middleware/uploadMiddleware");
const path = require("path");
const postController = require("./controllers/postController");
const commentController = require("./controllers/commentController");
const errorHanler = require("./middleware/errorMiddleware");
app.use(helmet());
app.use(express.json());
app.use(globalLimiter);

app.post("/register", userController.register);
app.post("/login", userController.login);
app.get("/profile", protect, userController.getProfile);
app.post(
  "/upload",
  protect,
  upload.single("profilePic"),
  userController.uploadProfilePic,
);
app.post("/posts/:id/comments", protect, commentController.addComment);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.post("/posts", protect, postController.createPost);
app.get("/posts", postController.getAllPosts);
app.put("/posts/:id", protect, postController.updatePost);
app.delete("/posts/:id", protect, postController.deletePost);
app.post("/posts/:id/like", protect, postController.toggleLike);
app.get("/posts/:id/comments", commentController.getPostComments);
app.use(errorHanler);

app.listen(3000, () => {
  logger.info("Server running on port 3000");
});
