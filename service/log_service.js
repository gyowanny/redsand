var logDao = require('../data/log_dao');

module.exports = {
    logUserAuthentication: function(login, orgId, ip, callback) {
        var log = {
            subject: 'AUTHENTICATION',
            org_id: orgId,
            ip: ip,
            data: {
                login: login
            },
            timestamp: new Date().toISOString()
        };
        logDao.save(log, function(err, result) {
           if (err) {
               callback(err, 'ERROR');
               return;
           }
           callback(null, 'OK');
        });
    }
};