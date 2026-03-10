const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");
const AppError = require("../utils/AppError");
const generateToken = require("../utils/generateToken");

const registerUser = async (username, email, password) => {
  const existingUser = await userModel.findUserByEmail(email);
  if (existingUser) {
    throw new Error("Email is already registered", 409);
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = await userModel.createUser(username, email, hashedPassword);
  const token = generateToken(newUser.id);
  return {
    user: newUser,
    token: token,
  };
};

module.exports = { registerUser };
