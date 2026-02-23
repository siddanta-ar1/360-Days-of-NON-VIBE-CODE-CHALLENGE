require("dotenv").config();
const { faker } = require("@faker-js/faker");
const bcrypt = require("bcrypt");
const db = require("./config/db");

const seedDatabase = async () => {
  try {
    console.log("Starting database seed...");

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    const userIds = [];

    console.log("Generating 50 users....");
    for (let i = 0; i < 50; i++) {
      const username = faker.internet.username();
      const email = faker.internet.email();
      const bio = faker.person.bio();

      const query = `
        INSERT INTO users (username, email, password, bio)
        VALUES ($1, $2, $3, $4) RETURNING id;
        `;
      const result = await db.query(query, [
        username,
        email,
        hashedPassword,
        bio,
      ]);
      userIds.push(result.rows[0].id);
    }

    console.log("Generating 200 posts...");
    for (let i = 0; i < 200; i++) {
      const randomUserId = userIds[Math.floor(Math.random() * userIds.length)];
      const title = faker.lorem.sentence();
      const content = faker.lorem.paragraphs(2);

      const query = `
        INSERT INTO posts (user_id, title, content)
        VALUES ($1, $2, $3);
        `;
      await db.query(query, [randomUserId, title, content]);
    }
    console.log("Sedding complete ! Database is full.");
    process.exit();
  } catch (error) {
    console.error("Seeding failed: ", error);
    process.exit(1);
  }
};

seedDatabase();
