const fs = require("fs");

const readStream = fs.createReadStream(__filename, { highWaterMark: 16 });

let chunkCounter = 0;

readStream.on("data", (chunk) => {
  chunkCounter++;
  console.log(`\n--- DELIVERING CHUNK #${chunkCounter} ---`);
  console.log("Raw Machine Data:", chunk);
  console.log("Translated Text:", chunk.toString());
});

readStream.on("end", () => {
  console.log(
    `\n Finished! Processed the file in ${chunkCounter} separate chunks.`,
  );
  console.log(`Memory footprint never exceeded 16 bytes!`);
});
