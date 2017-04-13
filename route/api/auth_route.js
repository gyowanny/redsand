var userDao = require('../../data/user_dao');
var orgDao = require('../../data/org_dao');
var tokenService = require('../../service/token_service');
var passwordService = require('../../service/password_service');
var logger = require('winston');
var config = require('../../config.js');
var base64 = require('base-64');

logger.level = config.logging.level;

var createResponseAsJson = function(isSuccess, message) {
    return {
        success: isSuccess,
        message: message
    };
};

var decodePayloadFromBase64ToUtf8Array = function(encodedPayload) {
    var bytes = base64.decode(encodedPayload);
    var decoded = new Buffer(bytes).toString('utf-8');
    return decoded.split(':');
}

var getTokenExpirationFromOrgOrDefaultFromConfig = function(org) {
    if (org) {
        return org.tokenExpiration;
    } else {
        return config.defaultTokenExpiration;
    }
}

module.exports = function(req, res) {
    var decodedPayload = decodePayloadFromBase64ToUtf8Array(req.body.auth);
    var decodedLogin = decodedPayload[0];
    var decodedPassword = decodedPayload[1];
    var requestedOrgId = req.body.org_id;

    userDao.findByLogin(decodedLogin, function(err, userFound) {

        if (err) {
            logger.log('error', 'login not authorized for user %s', decodedLogin);
            res.status(500).json(createResponseAsJson(false, 'ERROR \n'+JSON.stringify(err)));
        }

        if (!userFound) {
            logger.log('warn', 'login not authorized for user %s', decodedLogin);
            res.status(403).json(createResponseAsJson(false, 'UNAUTHORIZED'));
            return;
        }

        var passwordMatches = passwordService.matches(decodedPassword, userFound.password);

        if (passwordMatches == true && userFound.org_id.indexOf(requestedOrgId) > -1) {
            orgDao.findByOrgId(requestedOrgId, function(err, orgFound) {
                var tokenExpiration = getTokenExpirationFromOrgOrDefaultFromConfig(orgFound);

                //Removing the password field before encoding
                delete userFound.password;
                
                //signs and returns the token
                var token = tokenService.generate(userFound, config.secretKey, tokenExpiration);

                // returns the information including token as JSON
                var response = createResponseAsJson(true, 'AUTHORIZED');
                response.token = token;
                response.roles = userFound.roles;
                res.json(response);
            });

        } else {
            res.status(403).json(createResponseAsJson(false, 'UNAUTHORIZED'));
        }
    });
}