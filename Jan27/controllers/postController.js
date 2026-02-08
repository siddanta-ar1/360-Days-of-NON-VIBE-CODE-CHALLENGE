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
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const search = req.query.search || "";

    const query = `
      SELECT posts.id, posts.title, posts.content, users.username, posts.created_at
      FROM posts
      JOIN users ON posts.user_id = users.id
      ORDER BY posts.created_at DESC
      LIMIT $1 OFFSET $2;
      `;

    const searchPattern = `%${search}%`;
    const result = await db.query(query, [limit, offset], searchPattern);
    res.json({
      success: true,
      page: page,
      limit: limit,
      count: result.rows.length,
      posts: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content } = req.body;
    const userId = req.user.id;

    const query = `
      UPDATE posts
      SET title = $1, content = $2
      WHERE id = $3 AND user_id = $4
      RETURNING *;
      `;
    const result = await db.query(query, [title, content, id, userId]);
    if (result.rowCount === 0) {
      return res
        .status(403)
        .json({ message: "Not authorized or Post not found" });
    }
    res.json({
      success: true,
      message: "Post updated!",
      post: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const deletePost = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const query = `
    DELETE FROM posts
    WHERE id = $1 AND user_id = $2
    RETURNING *;
      `;
    const result = await db.query(query, [id, userId]);
    if (result.rowCount === 0) {
      return res.status(403).json({
        message: "Not authorized or Post not found",
      });
      res.json({
        success: true,
        message: "Post deleted successfully",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

const toggleLike = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const checkQuery =
      "SELECT * FROM likes WHERE user_id = $1 AND post_id = $2";
    const checkResult = await db.query(checkQuery, [userId, id]);

    if (checkResult.rows.length > 0) {
      await db.query("DELETE FROM likes WHERE user_id = $1 AND post_id = $2", [
        userId,
        id,
      ]);
      return res.json({ success: true, message: "Post Unliked" });
    } else {
      await db.query("INSERT INTO likes (user_id, post_id) VALUES ($1, $2)", [
        userId,
        id,
      ]);
      return res.json({ success: true, message: "Post Linked" });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};

module.exports = {
  createPost,
  getAllPosts,
  updatePost,
  deletePost,
  toggleLike,
};
