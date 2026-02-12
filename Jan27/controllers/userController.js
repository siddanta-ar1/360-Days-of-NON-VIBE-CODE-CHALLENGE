const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db");

const uploadProfilePic = async (req, res) => {
  try {
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
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const newUser = await userModel.createUser(username, email, hashedPassword);

    res.status(201).json({
      success: true,
      message: "User created in Database!",
      user: newUser,
    });
  } catch (err) {
    console.error(err);
    if (err.code === "23505") {
      return res.status(400).json({ message: "Email already exists" });
    }
    res.status(500).json({ message: "Server Error" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Check User
    const user = await userModel.findUserByEmail(email);
    if (!user) return res.status(401).json({ message: "Invalid Credentials" });

    // 2. Check Password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(401).json({ message: "Invalid Credentials" });

    // --- 3. GENERATE TOKEN (This was missing!) ---
    const token = jwt.sign(
      { id: user.id, username: user.username, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "1h" },
    );

    // 4. Send Token in Response
    res.json({
      success: true,
      message: "Login Successful",
      token: token, // <--- HERE IT IS!
      user: { id: user.id, username: user.username },
    });
  } catch (err) {
    console.error(err); // Fixed your 'console.err' typo too
    res.status(500).json({ message: "Server Error" });
  }
};

const getProfile = async (req, res) => {
  res.json({
    success: true,
    message: "Welcom to the VIP section.",
    user: req.user,
  });
};

module.exports = { register, login, getProfile, uploadProfilePic };
