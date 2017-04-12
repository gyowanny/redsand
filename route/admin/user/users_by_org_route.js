var userDao = require("../../../data/user_dao.js");

var createResponseAsJson = function(isSuccess, message) {
    return {
        success: isSuccess,
        message: message
    };
};

module.exports = function(req, res) {
    userDao.findByOrgId(req.params.orgid, function(err, users) {
        if (err) {
            console.log(err);
            res.json(createResponseAsJson(false, 'Can not retrieve the users by organization id \n'+err));
        } else {
            var response = createResponseAsJson(true, 'OK');
            response.value = users;
            res.json(response);
        }
    });
};