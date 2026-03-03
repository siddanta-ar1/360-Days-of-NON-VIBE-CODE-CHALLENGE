const winston = require("winston");

const isTesting = process.env.NODE_ENV === "test";

const logger = winston.createLogger({
  level: "info",
  silent: isTesting,
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.File({
      filename: "error.log",
      level: "error",
    }),
    new winston.transports.File({ filename: "combined.log" }),
  ],
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      formate: winston.format.simple(),
    }),
  );
}

module.exports = logger;
