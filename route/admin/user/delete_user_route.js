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

var isDeleted = function(result) {
    return result === 'DELETED';
}

var userNotFound = function(result) {
    return result === 'NOT_FOUND';
}

module.exports = function(req, res) {
    var id = req.params.id;
    userDao.delete(req.params.id, function(err, result) {
        if (err) {
            logger.log('err', 'Can not delete user ID %s', id);
            res.status(500).json(createResponseAsJson(false, err));
            return;
        }

        if (userNotFound(result)) {
            logger.log('warn', 'User with ID %s has not been not found', id);
            res.status(400).json(createResponseAsJson(false, result));
            return;
        }

        res.json(createResponseAsJson(isDeleted(result), result));
    });
};