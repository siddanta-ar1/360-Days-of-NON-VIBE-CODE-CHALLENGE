const name = "Siddanta";

const nameBuffer = Buffer.from(name);

console.log("--- String View ---");
console.log(name);

console.log("\n--- Buffer View (Hexadecimal) ---");
console.log(nameBuffer);

console.log("\n --- The First Byte ---");
console.log(nameBuffer[0]);
