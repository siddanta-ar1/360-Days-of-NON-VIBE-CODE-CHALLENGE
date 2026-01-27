// Day26/config/db.js
const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "postgres",
  password: "root", // Make sure this matches your actual password
  port: 5432,
});

module.exports = {
  query: (text, params) => pool.query(text, params),
};
