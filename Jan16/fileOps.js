const fs = require("fs");
const path = require("path");

console.log("Current Folder: ", __dirname);

const filePath = path.join(__dirname, "info.txt");
const outputPath = path.join(__dirname, "log.txt");

console.log("Target Files: ", filePath);

fs.readFile(filePath, "utf8", (err, data) => {
  if (err) {
    console.error("Error reading file: ", err);
    return;
  }

  console.log("Original Content: ", data);

  const newContent = `${data} \nchecked by System at: ${new Date().toISOString()}`;

  fs.writeFile(outputPath, newContent, (err) => {
    if (err) {
      console.err("Error writing file:", err);
    } else {
      console.log("Success! Created log.txt");
    }
  });
});

console.log("--- This line runs BEFORE the file is read ---");
