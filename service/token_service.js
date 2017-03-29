var jsonwWebToken = require('jsonwebtoken');

module.exports = {

    generateToken: function(user, key, expiration) {
        if (!user || Object.keys(user).length === 0) {
            return null;
        }

        console.log('User: '+user);

        return jsonwWebToken.sign(user, key, { expiresIn: expiration});
    }
}