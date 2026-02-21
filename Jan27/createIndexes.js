const db = require("./config/db");

const createIndexes = async () => {
  try {
    await db.query(`
      CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email
      ON users(email);
      `);
    console.log("Index created on users.email");
    await db.query(`
      CREATE INDEX IF NOT EXISTS idx_posts_created_at
      ON posts(created_at DESC);
      `);
    console.log("Index created on posts.created_at");
    process.exit();
  } catch (err) {
    console.error("Error creating indexes: ", err);
    process.exit(1);
  }
};

createIndexes();
