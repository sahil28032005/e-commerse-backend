const cloudinary = require('cloudinary').v2;
const connectToclouDinary = async function (req, res) {
    try {
        await cloudinary.config({
            cloud_name: process.env.cloud_name,
            api_key: process.env.api_key,
            api_secret: process.env.api_secret // Click 'View Credentials' below to copy your API secret
        });
        console.log("cloudinary connection made successfully!");
    }
    catch (err) {
        res.send("error: " + err.message);
    }
}
module.exports = connectToclouDinary;