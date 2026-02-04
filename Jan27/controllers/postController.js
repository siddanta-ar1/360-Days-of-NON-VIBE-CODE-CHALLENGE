const { get } = require("../../Jan24/routes/userRoutes");
const db = require("../config/db");

const createPost = async (req, res) => {
  try {
    const { title, content } = req.body;
    const userId = req.user.id;

    const query = `
      INSERT INTO posts (user_id, title, content)
      VALUES ($1, $2, $3)
      RETURNING *;
      `;
    const result = await db.query(query, [userId, title, content]);

    res.status(201).json({
      success: true,
      message: "Post created!",
      post: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const getAllPosts = async (req, res) => {
  try {
    const query = `
      SELECT posts.id, posts.title, posts.content, users.username
      FROM posts
      JOIN users ON posts.user_id = users.id
      ORDER BY posts.created_at DESC;
      `;
    const result = await db.query(query);
    res.json({ success: true, posts: result.rows });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = { createPost, getAllPosts };
