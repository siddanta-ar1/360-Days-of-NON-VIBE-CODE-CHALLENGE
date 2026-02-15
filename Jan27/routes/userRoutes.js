const express = require("express");
const router = express.Router();
const {
  register,
  login,
  getProfile,
} = require("../controllers/userController");
const { protect } = require("../middleware/authMiddleware");

const validate = require("../middleware/validateMiddleware");
const { registerSchema, loginSchema } = require("../schemas/userSchemas");

router.post("/register", validate(registerSchema), register);
router.post("/login", validate(loginSchema), login);

router.get("/profile", protect, getProfile);

module.exports = router;
