const db = require("./config/db");

const createPostTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;
  try {
    await db.query(query);
    console.log("Table 'posts' created successfully!");
  } catch (err) {
    console.error(err);
  }
};

createPostTable();
