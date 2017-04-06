var db = require('./db');
var r = require('rethinkdb');

module.exports =  {

    save: function(user, callback) {
        r.table('users').insert(user).run(db.global.connection, function(err, result) {
            if (err) {
                callback(err, 'ERROR');
            }
            callback(null, 'CREATED');
        })
    },

    findByLogin: function(userLogin, callback) {
        console.log('Finding for '+userLogin);
        r.table('users').filter({login: userLogin}).run(db.global.connection, function(err, cursor) {
           if (err) {
               return next(err);
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