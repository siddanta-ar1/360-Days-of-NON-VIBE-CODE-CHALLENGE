const db = require("./config/db");

const createCommentTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS comments (
    id SERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    `;
  try {
    await db.query(query);
    console.log("Commets table created successfully!");
  } catch (err) {
    console.error(err);
  }
};

createCommentTable();
