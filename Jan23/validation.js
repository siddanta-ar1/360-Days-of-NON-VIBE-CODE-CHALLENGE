const express = require("express");
const Joi = require("joi");
const app = express();

app.use(express.json());

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  age: Joi.number().integer().min(18).max(99),
});

const validateRequest = (req, res, next) => {
  const { error } = registerSchema.validate(req.body);

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.details[0].message,
    });
  }

  next();
};

app.post("/register", validateRequest, (req, res) => {
  res.json({
    success: true,
    message: "User Registered Successfully",
    user: req.body,
  });
});

app.listen(3000, () => {
  console.log("Server running on port 3000");
});
