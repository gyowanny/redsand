var db = require('./db');
var r = require('rethinkdb');

module.exports = {

    save: function(org, callback) {
        r.table('orgs').insert(org).run(db.global.connection, function(err, result) {
           if (err) {
               callback(err, null);
               return;
           }

           callback(null, 'CREATED');

        });
    },

    findByOrgId: function(orgId, callback) {
        r.table('orgs').filter({org_id: orgId}).run(db.global.connection, function(err, cursor) {
            if (err) {
                callback(err, null);
                return;
            }

            cursor.toArray(function(err, results) {
                if (err) {
                    callback(err, null);
                    return;
                }

                if (results.length === 0) {
                    callback(null, null);
                } else {
                    callback(null, results[0]);
                }
            });
        });
    }
}