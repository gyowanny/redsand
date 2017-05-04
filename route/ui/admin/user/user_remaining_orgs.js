var userDao = require("../../../../data/user_dao.js");
var orgDao = require("../../../../data/org_dao.js");
var config = require("../../../../config.js");
const logger = require('winston');
logger.level = config.logging.level;

var createResponseAsJson = function(isSuccess, message) {
    return {
        success: isSuccess,
        message: message
    };
};

module.exports = function(req, res) {
    var id = req.params.id;

    userDao.findById(id, function(err, userFound){

        if (!userFound) {
            logger.log('warn', 'User not found for id {%s}', id);
            res.status(404).json(createResponseAsJson(false, 'NOT_FOUND'));
            return;
        }

        orgDao.findOrgsExcluding(userFound.orgs, function(err, orgsFound) {
            res.json(createResponseAsJson(true, orgsFound));
            return;
        });

    });

}