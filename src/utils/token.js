const jwt = require('jsonwebtoken');

function generateToken(user){
    return jwt.sign(
        {
            id: user.id, role: user.role
        },
        process.env.JWT_SECRET,
        { expireIn: process.env.JWT_EXPIRES_IN || '7D' }
    );
}

module.exports = { generateToken };