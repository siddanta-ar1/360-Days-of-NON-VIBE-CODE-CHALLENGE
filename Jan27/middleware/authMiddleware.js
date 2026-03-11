const jwt = require("jsonwebtoken");
const ansyncHandler = require("express-async-handler");
const AppError = require("../utils/AppError");
const db = require("../config/db");
const protect = ansyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      const result = await db.query(
        "SELECT id, username, email FROM users WHERE id = $1",
        [decoded.id],
      );

      if (result.rows.length === 0) {
        throw new AppError(
          "The user belonging to this token no longer exists.",
          401,
        );
      }

      req.user = result.rows[0];
      next();
    } catch (error) {
      throw new AppError("Not authorized, token failed or expired", 401);
    }
  }
});

module.exports = { protect };
