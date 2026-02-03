const db = require("./config/db");

async function addColumn() {
  try {
    const query = "ALTER TABLE users ADD COLUMN profile_pic VARCHAR(255);";
    await db.query(query);
    console.log("Column 'profile_pic' added successfully! ");
  } catch (err) {
    console.log("Message:", err.message);
  }
}

addColumn();
