var userDao = require("../../../../data/user_dao.js");

var createResponseAsJson = function(isSuccess, message) {
    return {
        success: isSuccess,
        message: message
    };
};

module.exports = function(req, res){
    var userId = req.params.id;
    var updatedOrgs = req.body.data;

    console.log(updatedOrgs);

    userDao.findById(userId, function(err, userToUpdate) {
       if (err) {
           res.status(500).json(createResponseAsJson(false, err.message));
           return;
       }

       if (!userToUpdate) {
           res.status(404).json(createResponseAsJson(false, 'USER_NOT_FOUND'));
           return;
       }

        userToUpdate.orgs = updatedOrgs;

        userDao.save(userToUpdate, function(err, result) {
            if (err) {
                res.status(500).json(createResponseAsJson(false, err.message));
                return;
            }

           res.json(createResponseAsJson(true, 'UPDATED'));
        });
    });
}