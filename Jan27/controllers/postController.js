const asyncHandler = require("express-async-handler");
const db = require("../config/db");

const createPost = asyncHandler(async (req, res) => {
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
});

const getAllPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  const search = req.query.search || "";

  const query = `
      SELECT posts.id, posts.title, posts.content, users.username, posts.created_at,
      (SELECT COUNT(*) FROM likes WHERE likes.post_id = posts.id) AS like_count

      (
      SELECT COALESCE(json_agg(
      json_build_object(
      'id', c.id,
      'content', c.content,
      'username', cu.username
      )
      ),'[]')
      FROM comments c
      JOIN users cu ON c.user_id = cu.id
      WHERE c.post_id = posts.id
      ) AS comments

      FROM posts
      JOIN users ON posts.user_id = users.id
      WHERE posts.title ILIKE $3 OR posts.content ILIKE $3
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
});

const getPosts = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 10;

  const offset = (page - 1) * limit;

  const query = `
    SELECT p.id, p.title, p.content, p.created_at, u.username
    FROM posts p
    JOIN users u ON p.user_id = u.id
    ORDER BY p.created_at DESC
    LIMIT $1 OFFSET $2;
    `;
  const result = await db.query(query, [limit, offset]);
  const countResult = await db.query("SELECT COUNT(*) FROM posts");
  const totalPosts = parseInt(countResult.rows[0].count, 10);
  const totalPages = Math.ceil(totalPosts / limit);

  res.json({
    success: true,
    metadata: {
      currentPage: page,
      limit: limit,
      totalPosts: totalPosts,
      totalPages: totalPages,
    },
    posts: result.rows,
  });
});

const getPostById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const query = `
    SELECT p.id, p.title, p.content, p.created_at,
    --1. Nest the Author as a JSON json_build_object
    json_build_object(
    'id', u.id,
    'username', u.username,
    'profile_pic', u.profile_pic
    ) AS author,

    -- 2. Count the likes
    (SELECT COUNT(*) FROM likes l WHERE l.post_id = p.id) AS like_count,

    -- 3. Nest all comments as a JSON array (Handling 0 comments with COALESCE)
    COALESCE(
    (
    SELECT json_agg(
    json_build_object(
    'id', c.id,
    'content', c.content,
    'username', cu.username,
    'created_at', c.created_at
    ) ORDER BY c.created_at ASC
    )
    FROM comments c
    JOIN users cu ON c.user_id = cu.id
    WHERE c.post_id = p.id
    ), '[]'
    ) AS comments

    FROM posts p
    JOIN users u ON p.user_id = u.id --INNER JOIN is fine here (every post HAS to have an author)
    WHERE p.id = $1;
    `;
  const result = await db.query(query, [id]);

  if (result.rows.length === 0) {
    res.status(404);
    throw new Error("Post not found");
  }

  res.json({
    success: true,
    post: result.rows[0],
  });
});

const updatePost = asyncHandler(async (req, res) => {
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
});

const deletePost = asyncHandler(async (req, res) => {
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
});

const toggleLike = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  const checkQuery = "SELECT * FROM likes WHERE user_id = $1 AND post_id = $2";
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
});

module.exports = {
  createPost,
  getAllPosts,
  getPosts,
  updatePost,
  deletePost,
  toggleLike,
};
