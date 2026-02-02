const jwt = require('jsonwebtoken');

const generateToken = (id) => {
    // Changed: Don't embed simple role string inside token anymore as it's now complex
    // Or we could embed an array of role names if needed, but fetching from DB is safer for keeping permissions fresh
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '24h',
    });
};

module.exports = generateToken;
