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

module.exports = function(req, res) {

    var id = req.params.id;

    orgDao.findById(id, function(err, org) {

        if(err) {
            logger.log('error', 'An error occurred while searching for org with ID [%s] \n %s', id, err);
            res.status(500).json(createResponseAsJson(false, 'Can not find org by ID. \n'+err));
            return;
        }

        if (!org) {
            logger.log('warn', 'Org with ID [%s] not found', id);
            res.status(400).json(createResponseAsJson(false, 'NOT_FOUND'));
            return;
        }

        var orgChanges = req.body;

        if(!orgChanges.id) {
            orgChanges.id = id;
        }

        orgDao.save(orgChanges, function(err, result) {
            if (err) {
                logger.log('error', 'An error occurred while updating org with ID [%s] \n %s', id, err);
                res.status(500).json(createResponseAsJson(false, 'Can not update org with ID. \n'+err));
                return;
            }

            res.json(createResponseAsJson(true, 'UPDATED'));
        });
    });

};