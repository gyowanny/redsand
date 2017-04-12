var tokenService = require("../../service/token_service.js");
var config = require("../../config.js");
var _ = require("lodash");

module.exports = function(req, res) {
    var user = req.body.user;
    var token = req.body.token;

    if (!token) {
        res.status(403).send('Invalid body');
        return;
    }

    tokenService.validateAndDecode(token, config.secretKey, function (err, decoded) {
        if (err) {
            res.status(403).send(err);
            return;
        }

        if (user) {
            if (_.isEqual(decoded.user, user)) {
                res.status(204).send();
            } else {
                res.status(403).send();
            }
        } else {
            res.status(204).send();
        }
    });
}