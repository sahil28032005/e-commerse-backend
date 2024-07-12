const bcrypt = require('bcrypt');

const hashPass = async (password) => {
    try {
        const hashingRounds = 10;
        return await bcrypt.hash(password, hashingRounds);
    } catch (error) {
        console.log("Error hashing password:", error);
        throw error; // Re-throw the error to handle it in the caller function
    }
}

const compareHash = async (password, hashVal) => {
    return await bcrypt.compare(password, hashVal);
}

module.exports = { hashPass, compareHash };
