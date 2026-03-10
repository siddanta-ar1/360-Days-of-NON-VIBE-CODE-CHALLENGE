const jwt = require("jsonwebtoken");

const genereateToken = (id) => {
  const payload = { id };

  const secret = process.env.JWT_SECRET;

  const options = { expiresIn: "30d" };
  return jwt.sign(payload, secret, options);
};

module.exports = genereateToken;
