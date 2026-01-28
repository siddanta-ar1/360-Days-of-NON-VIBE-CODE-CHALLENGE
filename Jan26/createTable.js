const db = require("../Jan27/config/db");

const createTableQuery = `
  CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  `;
async function createTable() {
  try {
    console.log("Running Migration...");

    await db.query(createTableQuery);

    console.log("Table 'users' created successfully!");
  } catch (err) {
    console.log(" Migration Failed:", err.message);
  }
}
createTable();
