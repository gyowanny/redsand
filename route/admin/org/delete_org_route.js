const logger = require('winston');
var orgDao = require("../../../data/org_dao.js");
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

var orgNotFound = function(result) {
    return result === 'NOT_FOUND';
}

module.exports = function(req, res) {
    //deletes an org by id. Safer than by login
    var id = req.params.id;
    orgDao.delete(id, function(err, result) {
        if (err) {
            logger.log('err', 'Can not delete org ID %s', id);
            res.status(500).json(createResponseAsJson(false, err));
            return;
        }

        if (orgNotFound(result)) {
            logger.log('warn', 'Org with ID %s has not been not found', id);
            res.status(400).json(createResponseAsJson(false, result));
            return;
        }

        res.json(createResponseAsJson(isDeleted(result), result));
    });
};