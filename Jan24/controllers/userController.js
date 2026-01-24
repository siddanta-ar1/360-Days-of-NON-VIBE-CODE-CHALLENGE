const registerUser = (req, res) => {
  const newUser = req.body;
  res.status(201).json({
    success: true,
    message: "User registered successfully!",
    data: newUser,
  });
};

const loginUser = (req, res) => {
  res.json({ message: "Login successfull" });
};
module.exports = { registerUser, loginUser };
