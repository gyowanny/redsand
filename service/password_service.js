var bcrypt = require('bcrypt');

module.exports = {

    encrypt : function(plainPassword, saltRounds, callback) {
        bcrypt.hash(plainPassword, saltRounds, function(err, hashedPwd) {
            callback(err, hashedPwd);
        })
    },

    matches : function(plainPassword, hashedPwd, callback) {
        bcrypt.compare(plainPassword, hashedPwd, function(err, res) {
            callback(err, res);
        });
    }

}