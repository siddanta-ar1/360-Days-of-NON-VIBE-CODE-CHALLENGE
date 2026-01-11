const name = "NodeJS";

const nameBuffer = Buffer.from(name);

console.log(nameBuffer);

nameBuffer[0] = 74;

console.log(nameBuffer);
