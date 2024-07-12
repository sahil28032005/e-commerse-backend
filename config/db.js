const mongoose = require('mongoose');
require('dotenv').config({ path: 'credentials.env' });

const conDb = async () => {
    try {
        await mongoose.connect(process.env.mongodb_conn_url);
        console.log("Success for database cluster connection....");
    } catch (error) {
        console.log(error);
    }
};
module.exports = conDb;