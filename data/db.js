var async = require('async');
var r = require('rethinkdb');

module.exports = {

    global: {
        connection: null
    },

    init: function(config, callbackInit) {
        console.log('Starting database setup...');
        async.waterfall([
            function connect(callback) {
                r.connect(config.rethinkdb, callback);
            },
            function createDatabase(connection, callback) {
                //Create the database if needed.
                r.dbList().contains(config.rethinkdb.db).do(function(containsDb) {
                    return r.branch(
                        containsDb,
                        {created: 0},
                        r.dbCreate(config.rethinkdb.db)
                    );
                }).run(connection, function(err) {
                    callback(err, connection);
                });
            },
            function createTableUsers(connection, callback) {
                //Create the table if needed.
                r.tableList().contains('users').do(function(containsTable) {
                    return r.branch(
                        containsTable,
                        {created: 0},
                        r.tableCreate('users')
                    );
                }).run(connection, function(err) {
                    callback(err, connection);
                });
            },
            function createIndex(connection, callback) {
                //Create the index if needed.
                r.table('users').indexList().contains('login').do(function(hasIndex) {
                    return r.branch(
                        hasIndex,
                        {created: 0},
                        r.table('users').indexCreate('login')
                    );
                }).run(connection, function(err) {
                    callback(err, connection);
                });
            },
            function waitForIndex(connection, callback) {
                //Wait for the index to be ready.
                r.table('users').indexWait('login').run(connection, function(err, result) {
                    callback(err, connection);
                });
            }
        ], callbackInit);
    },

    close: function() {
        this.global.connection.close();
        this.global.connection = null;
    }

}