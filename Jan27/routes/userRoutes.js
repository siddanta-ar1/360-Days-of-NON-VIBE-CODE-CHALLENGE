const express = require("express");
const { authLimiter } = require("./middleware/limiter");
const router = express.Router();
const {
  register,
  login,
  getProfile,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const validate = require("../middleware/validateMiddleware");
const { registerSchema, loginSchema } = require("../schemas/userSchemas");

router.post("/register", authLimiter, validate(registerSchema), register);
router.post("/login", authLimiter, validate(loginSchema), login);

router.get("/profile", protect, getProfile);

module.exports = router;
