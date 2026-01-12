const fs = require("fs");

const readableStream = fs.createReadStream("input.txt");

const writableStream = fs.createWriteStream("output.txt");

readableStream.pipe(writableStream);

console.log("Piping in progress...");

readableStream.on("data", (chunk) => {
  console.log(`Received ${chunk.length} bytes of data.`);
});

readableStream.on("end", () => {
  console.log("Finished piping!");
});
