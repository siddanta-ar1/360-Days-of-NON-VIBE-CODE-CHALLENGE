const bcrypt = require("bcrypt");
const userModel = require("../models/userModel");

const registerUser = async (username, email, password) => {
  const existingUser = await userModel.findUserByEmail(email);
  if (existingUser) {
    throw new Error("Email is already registered");
  }

  const saltRounds = 10;
  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const newUser = await userModel.createUser(username, email, hashedPassword);

  return newUser;
};

module.exports = { registerUser };
