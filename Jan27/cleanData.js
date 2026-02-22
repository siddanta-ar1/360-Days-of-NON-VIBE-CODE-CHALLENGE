require("dotenv").config();
const db = require("./config/db");

const cleanDb = async () => {
  try {
    await db.query("DELETE FROM users WHERE email = 'hello@test.com'");
    console.log("Deleted duplicate Alices!");
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

cleanDb();
