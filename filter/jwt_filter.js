var jwt = require("jsonwebtoken");
var config = require("../config.js");

var extractTokenFromRequest = function(req) {
    return req.headers['x-access-token'] || req.body.token || req.query.token;
}

module.exports = function(req, res, next) {

    // check header or url parameters or post parameters for token
    var token = extractTokenFromRequest(req);

    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, config.secretKey, function (err, decoded) {
            if (err) {
                return res.json({success: false, message: 'Failed to verify token.'});
            } else {
                // if token is valid then save it in the request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });
    }
};