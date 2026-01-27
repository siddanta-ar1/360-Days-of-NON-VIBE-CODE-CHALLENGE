const db = require("./config/db");

async function reset() {
  try {
    console.log(" Dropping table 'users'...");
    await db.query("DROP TABLE IF EXISTS users;");
    console.log("Table dropped");
  } catch (err) {
    console.error(err);
  }
}
reset();
