const { pool } = require("pg");
const pool = new Pool({
  /* CONNCTION DETAILS FROM DAY 85 */
});

const purchaseCourse = async (userId, courseId, price) => {
  const client = await pool.connect();

  try {
    await client.query("BEGIN");

    await client.query(
      "UPDATE users SET balance = balance - $1 WHERE Id = $2",
      [price, userId],
    );

    await client.query(
      "INSERT INTO unlocked_courses (user_id, course_id) VALUES ($1, $2)",
      [userId, courseId],
    );
    await client.query("COMMIT");
    console.log("Purchase successfu. Data safely committed.");
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Transaction failed! Money refunded. Error:", error.message);
  } finally {
    client.release();
  }
};
