const userModel = require("../models/userModel");

const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    const newUser = await userModel.createUser(username, email, password);

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

module.exports = { register };
