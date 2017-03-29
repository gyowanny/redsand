var jsonwWebToken = require('jsonwebtoken');

module.exports = {

    generate: function(user, key, expiration) {
        if (!user || Object.keys(user).length === 0) {
            return null;
        }

        return jsonwWebToken.sign(user, key, { expiresIn: expiration});
    },

    validateAndDecode: function(token, key, callback) {
        jsonwWebToken.verify(token, key, function(err, decoded) {
            callback(err, decoded);
        });
    }
}