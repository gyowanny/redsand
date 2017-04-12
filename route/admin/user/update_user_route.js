const logger = require('winston');
var userDao = require("../../../data/user_dao.js");
var config = require("../../../config.js");

logger.level = config.logging.level;

var createResponseAsJson = function(isSuccess, message) {
    return {
        success: isSuccess,
        message: message
    };
};

module.exports = function(req, res) {
    var id = req.params.id;

    userDao.findById(id, function(err, userFound) {
        if (err) {
            logger.log('Can not find user by ID [%s] \n %s', id, err);
            res.json(createResponseAsJson(false, 'Can not find user by ID. \n'+err));
            return;
        }

        if (!userFound) {
            res.status(400).json(createResponseAsJson(false, 'User not found'));
            return;
        }

        var userChanges = req.body;
        if (!userChanges.id) {
            userChanges.id = id;
        }

        userDao.save(userChanges, function (err, result) {
            if (err) {
                logger.log('Can not update user with ID [%s] \n %s', id, err);
                res.json(createResponseAsJson(false, 'Can not update user with ID. \n'+err));
                return;
            }

            res.json(createResponseAsJson(true, 'UPDATED'));
        });
    })
};