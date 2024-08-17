const redis = require('redis');

const client = redis.createClient({
    password: process.env.REDIS_PASSWORD,  // Replace with your actual Redis Cloud password
    socket: {
        host: process.env.REDIS_URI_HOST,
        port: 16822
    }
});

client.on('error', (err) => console.log("reddis clinet error: ", err));

async function connectToReddis(req, res) {
    try {
        await client.connect();
        console.log("connected to reddis client");
    }
    catch (err) {
        console.log("problem arrived", err.message);
    }
}

module.exports = { client, connectToReddis }