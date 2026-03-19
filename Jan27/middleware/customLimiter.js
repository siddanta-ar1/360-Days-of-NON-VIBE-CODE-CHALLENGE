const rateLimits = new Map();
const Redis = require("ioredis");

const redis = new Redis({
  host: "127.0.0.1",
  port: 6379,
});

const redisTokenBucket = async (req, res, next) => {
  const ip = req.ip;
  const CAPACITY = 5;
  const REFILL_RATE_MS = 1000;
  const now = Date.now();

  let rawBucket = await redis.get(ip);
  let bucket;

  if (!rawBucket) {
    bucket = { tokens: CAPACITY, lastRefill: now };
  } else {
    bucket = JSON.parse(rawBucket);
  }

  const timePassed = now - bucket.lastRefill;
  const tokensToAdd = Math.floor(timePassed / REFILL_RATE_MS);

  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(CAPACITY, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    await redis.set(ip, JSON.stringify(bucket), "PX", 10000);

    next();
  } else {
    res.status(429).json({ error: "Too Many Requests. Blocked by Redis." });
  }
};
const tokenBucketLimiter = (req, res, next) => {
  const ip = req.ip;
  const now = Date.now();
  const CAPACITY = 5;
  const REFILL_RATE_MS = 1000;

  if (!rateLimits.has(ip)) {
    rateLimits.set(ip, { tokens: CAPACITY, lastRefill: now });
  }
  const bucket = rateLimits.get(ip);

  const timePassed = now - bucket.lastRefill;
  const tokensToAdd = Math.floor(timePassed / REFILL_RATE_MS);

  if (tokensToAdd > 0) {
    bucket.tokens = Math.min(CAPACITY, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }

  if (bucket.tokens > 0) {
    bucket.tokens -= 1;
    next();
  } else {
    res.status(429).json({
      error: "Too Many Requests. Please slow down.",
    });
  }
};

module.exports = { tokenBucketLimiter, redisTokenBucket };
