var userDao = require('../../data/user_dao');
var orgDao = require('../../data/org_dao');
var tokenService = require('../../service/token_service');
var passwordService = require('../../service/password_service');
var logger = require('winston');
var config = require('../../config.js');

logger.level = config.logging.level;

var createResponseAsJson = function(isSuccess, message) {
    return {
        success: isSuccess,
        message: message
    };
};

module.exports = function(req, res) {
    var login = req.body.login;
    var password = req.body.password;

    userDao.findByLogin(login, function(err, user) {

        if (err || !user) {
            logger.log('warn', 'login not authorized for user %s', login);
            res.status(403).json(createResponseAsJson(false, 'UNAUTHORIZED'));
        } else {
            var response;
            var match = passwordService.matches(password, user.password);

            if (match == true) {
                orgDao.findByOrgId(user.org_id, function(err, org) {
                    var expiry = "24h";
                    if (org) {
                        expiry = org.tokenExpiration;
                    }
                    //signs and returns the token
                    var token = tokenService.generate(user, config.secretKey, expiry);

                    // returns the information including token as JSON
                    response = createResponseAsJson(true, 'OK');
                    response.token = token;
                    res.json(response);
                });

            } else {
                res.status(403).json(createResponseAsJson(false, 'UNAUTHORIZED'));
            }
        }
    });
}