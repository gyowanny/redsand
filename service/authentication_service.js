var userDao = require('../data/user_dao');
var orgDao = require('../data/org_dao');
var tokenService = require('./token_service');
var passwordService = require('./password_service');
var logger = require('winston');
var config = require('../config.js');
var logService = require('./log_service');

logger.level = config.logging.level;

var getTokenExpirationFromOrgOrDefaultFromConfig = function(org) {
    if (org) {
        return org.tokenExpiration;
    } else {
        return config.defaultTokenExpiration;
    }
};

var getRolesForOrg = function(user, orgId) {
    for(var i = 0; i < user.orgs.length; i++) {
        if (user.orgs[i].org_id === orgId) {
            return user.orgs[i].roles;
        }
    }
    return null;
};

var createResponseAsJson = function(isSuccess, message) {
    return {
        success: isSuccess,
        message: message
    };
};

module.exports = function(req, login, password, orgId, callback) {
    userDao.findByLogin(login, function(err, userFound) {

        if (err) {
            logger.log('error', 'login error for user %s', login);
            callback(new Error('login error'), null);
            return;
        }

        if (!userFound) {
            logger.log('warn', 'login not authorized for user %s', login);
            callback(new Error('UNAUTHORIZED'), null);
            return;
        }

        var passwordMatches = passwordService.matches(password, userFound.password);
        var rolesForRequestedOrg = getRolesForOrg(userFound, orgId);

        if (passwordMatches == true && rolesForRequestedOrg) {
            orgDao.findByOrgId(orgId, function(err, orgFound) {
                if (!orgFound) {
                    logger.log('warn', 'User %s tried to login in an non-existent org %s', login, orgId);
                    callback(new Error('UNAUTHORIZED'), null);
                    return;
                }

                if (orgFound.inactive === true) {
                    logger.log('warn', 'User %s tried to login in an inactive org %s', login, orgFound.org_id);
                    callback(new Error('UNAUTHORIZED'), null);
                    return;
                }

                var tokenExpiration = getTokenExpirationFromOrgOrDefaultFromConfig(orgFound);

                //Removing the password field before encoding
                delete userFound.password;

                //signs and returns the token
                var token = tokenService.generate(userFound, config.secretKey, tokenExpiration);

                // returns the information including token as JSON
                var response = createResponseAsJson(true, 'AUTHORIZED');
                response.token = token;
                response.roles = rolesForRequestedOrg;

                var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress || '127.0.0.1';

                logService.logUserAuthentication(login, orgId, ip, function(err, result) {
                    callback(err, response);
                    return;
                });
            });

        } else {
            callback(new Error('UNAUTHORIZED'), null);
            return;
        }
    });
}