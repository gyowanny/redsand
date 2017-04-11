var db = require('./db');
var r = require('rethinkdb');

module.exports = {

    save: function(org, callback) {
        if(org.id) {
            var id = org.id;
            delete org.id;

            r.table('orgs').get(id).update(org).run(db.global.connection, function (err, result) {
                if (err) {
                    callback(err, 'ERROR');
                    return;
                }

                callback(null, 'UPDATED');

            });
        } else {
            r.table('orgs').insert(org).run(db.global.connection, function (err, result) {
                if (err) {
                    callback(err, 'ERROR');
                    return;
                }

                callback(null, 'CREATED');

            });
        }
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
    },

    orgIdExists: function(orgId) {
        return r.table('orgs')('org_id').count(orgId).run(db.global.connection, function(err, count) {
            if (err) {
                throw err;
            }

            return Boolean(count > 0);
        });
    },

    findById: function(id, callback) {
        r.table('orgs').get(id).run(db.global.connection, function(err, org) {
            if (err) {
                callback(err, null);
                return;
            }

            callback(null, org);
        });
    },

    delete: function(id, callback) {
        r.table('orgs').get(id).delete().run(db.global.connection, function(err, result) {
            if (err) {
                callback(err, null);
                return;
            }

            if (result.deleted === 1) {
                callback(null, 'DELETED');
            } else {
                callback(null, 'NOT_FOUND');
            }
        });
    }

}