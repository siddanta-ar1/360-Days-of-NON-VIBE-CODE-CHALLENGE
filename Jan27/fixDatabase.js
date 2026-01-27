const db = require("./config/db");

async function fix() {
  try {
    console.log("Dropping old table...");
    await db.query("DROP TABLE IF EXISTS users;");
    console.log("Creating new table...");
    const createQuery = `
      CREATE TABLE users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(50) NOT NULL,
      email VARCHAR(100) NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      `;

    await db.query(createQuery);
    console.log("Table 'users' created with 'email' column!");
  } catch (err) {
    console.log("Error:", err.message);
  }
}
fix();
