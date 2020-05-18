const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET_KEY;

function signKey(userId, userEmail, roles={}) {
    return jwt.sign(
        {
            userId,
            userEmail,
            roles
        },
        secretKey,
        {
            expiresIn: '1d'
        }
    );
}

module.exports = {
    secretKey,
    signKey
};
