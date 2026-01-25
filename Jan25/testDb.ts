const db = require("./db");

async function testConnection() {
  try {
    console.log("Connecting to the database...");

    const res = await db.query("SELECT NOW()");

    console.log("Database Connected Successfully!");
    console.log("Current DB Time:", res.rows[0].now);
  } catch (err) {
    console.error("Connection Failed!", err);
  }
}
testConnection();
