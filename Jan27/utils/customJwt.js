const crypto = require("crypto");

const generateCustomJWT = (payload, secret) => {
  const header = { alg: "HS256", typ: "JWT" };
  const encodedHeader = Buffer.from(JSON.stringify(header)).toString(
    "base64url",
  );

  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
    "base64url",
  );
  const signatureInput = `${encodedHeader}.${encodedPayload}`;

  const signature = crypto
    .createHmac("sha256", secret)
    .update(signatureInput)
    .digest("base64url");
  return `${signatureInput}.${signature}`;
};

const mySecret = "super_secret_noteacher_key";
const myToken = generateCustomJWT({ id: 99, role: "admin" }, mySecret);
console.log("Your Native JWT:", myToken);
