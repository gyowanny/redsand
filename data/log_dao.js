var db = require('./db');
var r = require('rethinkdb');

const TABLE = db.global.tables.logs;

module.exports = {

    save: function(log, callback) {
        r.table(TABLE).insert(log).run(db.global.connection, function (err, result) {
            if (err) {
                callback(err, 'ERROR');
                return;
            }

            callback(null, 'CREATED');

        });
    },

    findBySubjectAndOrgId: function(subject, orgId, callback) {
        r.table(TABLE).filter({subject: subject, org_id: orgId}).run(db.global.connection, function (err, cursor) {
            if (err) {
                callback(err, 'ERROR');
                return;
            }

            cursor.toArray(function(err, items) {
                if (err) {
                    callback(err, null);
                    return;
                }

                callback(null, items);
            });
        });
    }
};