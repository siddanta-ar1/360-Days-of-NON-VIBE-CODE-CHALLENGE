const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const corsOptions = {
  origin: [
    "http://localhost:5173",
    "https://scholarspoint.net",
    "https://www.scholarspoint.net",
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true,
  optionsSuccessStatus: 200,
};
const app = express();
app.use(cors(corsOptions));
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

const appLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: {
    success: false,
    message:
      "Too many requests from this IP, please try again after 15 minutes",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use("/api", appLimiter);

app.post("/api/v1/register", userController.register);
app.post("/api/v1/login", userController.login);
app.get("/api/v1/profile", protect, userController.getProfile);
app.post(
  "/api/v1/upload",
  protect,
  upload.single("profilePic"),
  userController.uploadProfilePic,
);
app.post("/api/v1/posts/:id/comments", protect, commentController.addComment);
app.use("/api/v1/uploads", express.static(path.join(__dirname, "uploads")));
app.post("/api/v1/posts", protect, postController.createPost);
app.get("/api/v1/posts", postController.getAllPosts);
app.put("/api/v1/posts/:id", protect, postController.updatePost);
app.delete("/api/v1/posts/:id", protect, postController.deletePost);
app.post("/api/v1/posts/:id/like", protect, postController.toggleLike);
app.get("/api/v1/posts/:id/comments", commentController.getPostComments);
app.use(errorHanler);

app.listen(3000, () => {
  logger.info("Server running on port 3000");
});
