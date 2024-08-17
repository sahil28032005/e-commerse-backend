const redis = require('redis');

const client = redis.createClient({
    url: process.env.REDIS_URI,
    password: process.env.REDIS_PASSWORD

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