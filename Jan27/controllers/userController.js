const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");
const asyncHandler = require("express-async-handler");
const userService = require("../services/userService");
const Redis = require('ioredis');
const redis = new Redis({ host: "127.0.0.1", port: 6379 });
// 1. Upload Profile Pic
const uploadProfilePic = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please upload a file" });
  }
  const fileUrl = `/upload/${req.file.filename}`;
  const userId = req.user.id;

  const query =
    "UPDATE users SET profile_pic = $1 WHERE id = $2 RETURNING username, email, profile_pic";
  const result = await db.query(query, [fileUrl, userId]);

  res.json({
    success: true,
    message: "Profile updated!",
    user: result.rows[0],
  });
});

// 2. Register
const register = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;
  const newUser = await userModel.createUser(username, email, hashedPassword);
  
  const job = JSON.stringify({ email: email, type: "Welcome" });
  await redis.lpush("emailQueue", job);
  
  res.status(201).json({
    success: true,
    message: "User created in Database!",
    user: newUser,
  });
});

// 3. Login
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  // Check User
  const user = await userModel.findUserByEmail(email);
  if (!user) return res.status(401).json({ message: "Invalid Credentials" });

  // Check Password
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(401).json({ message: "Invalid Credentials" });

  // Generate Token
  const token = jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "1h" },
  );

  // Send Response
  res.json({
    success: true,
    message: "Login Successful",
    token: token,
    user: { id: user.id, username: user.username },
  });
});

// 4. Get Profile
const getProfile = asyncHandler(async (req, res) => {
  res.json({
    success: true,
    message: "Welcome to the VIP section.",
    user: req.user,
  });
});

module.exports = { register, login, getProfile, uploadProfilePic };
