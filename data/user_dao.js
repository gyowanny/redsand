var db = require('./db');
var r = require('rethinkdb');

const TABLE = db.global.tables.users;

module.exports =  {

    save: function(user, callback) {
        if (user.id) {
            var id = user.id;
            delete user.id;
            r.table(TABLE).get(id).update(user).run(db.global.connection, function(err, result) {
                if (err) {
                    callback(err, 'ERROR');
                    return;
                }

                callback(null, 'UPDATED');
            });
        } else {
            user.create_date = new Date().toISOString();
            r.table(TABLE).insert(user).run(db.global.connection, function (err, result) {
                if (err) {
                    callback(err, 'ERROR');
                    return;
                }

                callback(null, 'CREATED');
            });
        }
    },

    loginExists: function(login) {
        return r.table(TABLE)('login').count(login).run(db.global.connection, function(err, count) {
           if (err) {
               throw err;
           }

           return Boolean(count > 0);
        });
    },

    findByLogin: function(userLogin, callback) {
        r.table(TABLE).filter({login: userLogin}).run(db.global.connection, function(err, cursor) {
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

    findByOrgId: function(orgId, callback) {
        r.table(TABLE)
            .filter(r.row('orgs').contains(function(org) {
                return org('org_id').eq(orgId);
            }))
            .run(db.global.connection, function(err, cursor) {
               if (err) {
                   callback(err, null);
                   return;
               }

               cursor.toArray(callback);
            });
    },

    findById: function(id, callback) {
        r.table(TABLE).get(id).run(db.global.connection, function(err, user) {
            if (err) {
                callback(err, null);
                return;
            }
           callback(null, user);
        });
    },

    delete: function(id, callback) {
        r.table(TABLE).get(id).delete().run(db.global.connection, function(err, result) {
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