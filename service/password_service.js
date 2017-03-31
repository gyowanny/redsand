var bcrypt = require('bcrypt');

module.exports = {

    encrypt : function(plainPassword, saltRounds) {
        if (!plainPassword) {
            return null;
        }
        return bcrypt.hashSync(plainPassword, saltRounds);
    },

    matches : function(plainPassword, hashedPwd, callback) {
        return bcrypt.compareSync(plainPassword, hashedPwd);
    }

}