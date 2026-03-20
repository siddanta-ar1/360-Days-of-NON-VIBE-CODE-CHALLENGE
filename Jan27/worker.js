const Redis = require('ioredis');

const redis = new Redis({ host: '127.0.0.1', port: 6379 });

console.log("Background Worker is online. Waiting for jobs...");

const processQueue = async () => {
    while (true) {
        const [queueName, jobData] = await redis.brpop('emailQueue', 0);
        console.log(`\n[x] Processing ${type} email for ${email}...`);

        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log(`Email successfully sent to ${email}!`);
    }
};

processQueue();