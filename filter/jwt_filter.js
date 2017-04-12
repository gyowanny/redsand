var jwt = require("jsonwebtoken");
var config = require("../config.js");

var extractToken = function(req) {
    return req.body.token || req.query.token || req.headers['x-access-token'];
}

module.exports = function(req, res, next) {

    // check header or url parameters or post parameters for token
    var token = extractToken(req);

    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, config.secretKey, function (err, decoded) {
            if (err) {
                return res.json({success: false, message: 'Failed to authenticate token.'});
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
                return;
            }
        });

    }

    // if there is no token
    // return an error
    return res.status(403).send({
        success: false,
        message: 'No token provided.'
    });

};