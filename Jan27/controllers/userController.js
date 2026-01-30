const userModel = require("../models/userModel");
const bcrypt = require("bcrypt");

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
    console.log("1. Login Request received:", req.body);
    const { email, password } = req.body;

    if (!email || !password) {
      console.log("Missing email or password");
      return res.status(400).send("Missing data");
    }

    const user = await userModel.findUserByEmail(email);
    console.log("2. User found in DB:", user);

    if (!user) {
      console.log("User not found in DB");
      return res.status(401).json({ message: "Invalid Credentials" });
    }

    console.log("3. Comparing password....");
    console.log(" Input: ", password);
    console.log(" Stored Hash: ", user.password);

    const isMatch = await bcrypt.compare(password, user.password);
    console.log("4. Password Match Result: ", isMatch);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    res.json({ success: true, user: user });
  } catch (err) {
    console.error(" The crash happened here:");
    console.err(err);
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

module.exports = { register, login, getProfile };
