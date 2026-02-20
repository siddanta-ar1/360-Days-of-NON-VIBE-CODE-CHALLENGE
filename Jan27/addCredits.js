const db = require("./config/db");

const addCreditsColumn = async () => {
  try {
    await db.query(
      "ALTER TABLE users ADD COLUMN IF NOT EXISTS credits INTERGER DEFAULT 100;",
    );
    console.log("Credits column added!");
  } catch (err) {
    console.error(err);
  }
};

addCreditsColumn();
