const asyncHandler = require("express-async-handler");
const db = require("./config/db");

const transferCredits = asyncHandler(async (req, res) => {
  const { amount, toUserId } = req.body;
  const fromUserId = req.user.id;

  const client = await db.pool.connect();

  try {
    await client.query("BEGIN");

    const senderRes = await client.query(
      "SELECT credits FROM users WHERE id = $1",
      [fromUserId],
    );
    const sender = senderRes.rows[0];

    if (sender.credits < amount) {
      res.status(400);
      throw new Error("Insufficient funds");
    }

    await client.query(
      "UPDATE users SET credits = credits - $1 WHERE id = $2",
      [amount, fromUserId],
    );
    await client.query(
      "UPDATE users SET credits = credits + $1 WHERE id = $2",
      [amount, toUserId],
    );
    await client.query("COMMIT");

    res.json({ success: true, message: "Transfer successful" });
  } catch (error) {
    await client.query("ROLLBACK");
    res.status(500);
    throw error;
  } finally {
    client.release();
  }
});

module.exports = { transferCredits };
