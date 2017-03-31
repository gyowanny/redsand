var jsonWebToken = require('jsonwebtoken');

module.exports = {

    generate: function(user, key, expiration) {
        if (!user || Object.keys(user).length === 0) {
            return null;
        }

        return jsonWebToken.sign(user, key, { expiresIn: expiration});
    },

    validateAndDecode: function(token, key) {
        return jsonWebToken.verify(token, key);
    }
}