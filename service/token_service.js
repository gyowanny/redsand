var jsonWebToken = require('jsonwebtoken');

module.exports = {

    generate: function(user, key, expiration) {
        if (!user || Object.keys(user).length === 0) {
            return null;
        }

        delete user.id;
        delete user.password;

        return jsonWebToken.sign({user: user}, key, { expiresIn: expiration});
    },

    validateAndDecode: function(token, key, callback) {
        return jsonWebToken.verify(token, key, function(err, decoded) {
            if (err) {
                if (err.name === 'TokenExpiredError') {
                    callback('TOKEN_EXPIRED', decoded);
                    return;
                } else {
                    callback(err, decoded);
                    return;
                }
            }

            callback(null, decoded);
        });
    }
}