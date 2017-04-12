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
    var org = req.body;

    orgDao.orgIdExists(org.org_id).then(function(orgIdAlreadyExists) {

        if (orgIdAlreadyExists) {
            logger.log('warn', 'Can not create org. Org ID %s already exists', org.org_id);
            res.status(400).json(createResponseAsJson(false, 'ORG_ID_EXISTS'));
            return;
        }

        orgDao.save(org, function(err, result) {
            if (err) {
                res.status(500).json(createResponseAsJson(false, 'Can not create org. \n'+err));
                return;
            }

            res.json(createResponseAsJson(true, 'CREATED'));
        });
    });

};