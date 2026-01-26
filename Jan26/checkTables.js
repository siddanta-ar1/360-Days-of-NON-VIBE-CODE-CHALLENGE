// Day26/createTable.js
const db = require("./config/db"); // This looks for config/db.js in the current folder

const createTableQuery = `
    CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
`;

async function createTable() {
  try {
    console.log("Running Migration...");
    await db.query(createTableQuery);
    console.log("✅ Table 'users' created successfully!");
  } catch (err) {
    console.error("❌ Migration Failed:", err.message);
  }
}

createTable();
