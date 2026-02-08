const db = require("./config/db");

const createLikesTable = async () => {
  const query = `
    CREATE TABLE IF NOT EXISTS likes (
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    post_id INTEGER REFERENCES posts(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, post_id) -- Composite Key!
    );
    `;

  try {
    await db.query(query);
    console.log("Likes table created successfully!");
  } catch (err) {
    console.error(err);
  }
};
createLikesTable();
