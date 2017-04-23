var authenticationService = require('../../service/authentication_service');
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
};

module.exports = function(req, res) {
    var decodedPayload = decodePayloadFromBase64ToUtf8Array(req.body.auth);
    var decodedLogin = decodedPayload[0];
    var decodedPassword = decodedPayload[1];
    var requestedOrgId = req.body.org_id;

    authenticationService(req, decodedLogin, decodedPassword, requestedOrgId, function(err, result) {
        if (err) {
            if (err.message === 'UNAUTHORIZED') {
                res.status(403).json(createResponseAsJson(false, err.message));
            } else {
                res.status(500).json(createResponseAsJson(false, JSON.stringify(err)));
            }

            return;
        }

        res.json(result);
    });

}