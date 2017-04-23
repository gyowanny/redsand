var authenticationService = require("../../../service/authentication_service");

module.exports = function(req, res, callback){

    authenticationService(req, req.body.login, req.body.password, req.body.org_id, function(err, result) {
        if (err) {
            callback(err, null);
            return;
        }

        req.session.user = {
            login: req.body.login,
            token: result.token,
            roles: result.roles
        };

        callback(null, 'AUTHORIZED');
    });
}