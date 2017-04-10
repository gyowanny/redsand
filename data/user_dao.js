var db = require('./db');
var r = require('rethinkdb');

module.exports =  {

    save: function(user, callback) {
        r.table('users').insert(user).run(db.global.connection, function(err, result) {
            if (err) {
                callback(err, 'ERROR');
                return;
            } else {
                callback(null, 'CREATED');
            }
        });
    },

    loginExists: function(login) {
        return r.table('users')('login').count(login).run(db.global.connection, function(err, count) {
           if (err) {
               throw err;
           }

           return Boolean(count > 0);
        });
    },

    findByLogin: function(userLogin, callback) {
        r.table('users').filter({login: userLogin}).run(db.global.connection, function(err, cursor) {
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
        r.table('users')
            .filter(function(user) {
                    return user('org_id').contains(orgId);
                })
            .run(db.global.connection, function(err, cursor) {
               if (err) {
                   callback(err, null);
                   return;
               }

               cursor.toArray(callback);
            });
    }

}