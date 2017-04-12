const logger = require('winston');
var userDao = require("../../../data/user_dao.js");
var config = require("../../../config.js");
var passwordService = require("../../../service/password_service.js");

logger.level = config.logging.level;

var createResponseAsJson = function(isSuccess, message) {
    return {
        success: isSuccess,
        message: message
    };
};

module.exports = function(req, res) {
    var user = req.body;

    userDao.loginExists(user.login).then(function(exists) {

        if (exists) {
            logger.log('warn', 'Can not create user. Login %s already exists', user.login);
            res.status(403).json(createResponseAsJson(false, 'LOGIN_EXISTS'));
            return;
        }

        user.password = passwordService.encrypt(user.password, config.password.saltRounds);
        userDao.save(user, function(err, result) {
            if (err) {
                logger.log('err', err);
                res.json(createResponseAsJson(false, 'Can not create user. \n'+err));
            } else {
                res.json(createResponseAsJson(true, 'CREATED'));
            }
        });
    });
};