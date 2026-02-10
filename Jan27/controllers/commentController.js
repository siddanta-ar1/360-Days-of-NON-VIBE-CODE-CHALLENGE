const db = require("../config/db");

const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user.id;
    if (!content) {
      return res.status(400).json({
        message: "Comment cannot be empty",
      });
    }
    const query = `
      INSERT INTO comments (post_id, user_id, content)
      VALUES ($1, $2, $3)
      RETURNING *;
      `;
    const result = await db.query(query, [id, userId, content]);

    res.status(201).json({
      success: true,
      message: "Comment added!",
      comment: result.rows[0],
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

const getPostComments = async (req, res) => {
  try {
    const { id } = req.params;

    const query = `
      SELECT comments.id, comments.content, comments.created_at, users.username, users.profile_pic
      FROM comments
      JOIN users ON comments.user_id = users.id
      WHERE commetns.post_id = $1
      ORDER BY comments.created_at ASC;
      `;

    const result = await db.query(query, [id]);

    res.json({
      success: true,
      comments: result.rows,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      message: "Server Error",
    });
  }
};

module.exports = { addComment, getPostComments };
