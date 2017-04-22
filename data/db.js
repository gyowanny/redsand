var async = require('async');
var r = require('rethinkdb');
const logger = require('winston');



module.exports = {

    global: {
        connection: null,
        tables: {
            users: 'users',
            orgs: 'orgs',
            logs: 'logs'
        }
    },

    init: function(config, callbackInit) {

        logger.level = config.logging.level;
        logger.log('debug', 'Starting database setup...');

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

            function createTableOrgs(connection, callback) {
                //Create the table if needed.
                r.tableList().contains('orgs').do(function(containsTable) {
                    return r.branch(
                        containsTable,
                        {created: 0},
                        r.tableCreate('orgs')
                    );
                }).run(connection, function(err) {
                    callback(err, connection);
                });
            },

            function createTableLogs(connection, callback) {
                //Create the table if needed.
                r.tableList().contains('logs').do(function(containsTable) {
                    return r.branch(
                        containsTable,
                        {created: 0},
                        r.tableCreate('logs')
                    );
                }).run(connection, function(err) {
                    callback(err, connection);
                });
            },

            function createUserLoginIndex(connection, callback) {
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

            function createOrgsOrgIdIndex(connection, callback) {
                //Create the index if needed.
                r.table('orgs').indexList().contains('org_id').do(function(hasIndex) {
                    return r.branch(
                        hasIndex,
                        {created: 0},
                        r.table('orgs').indexCreate('org_id')
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

        function createTableIfNeeded (table, connection, callback) {
            console.log('### Creating table -> ', table);
            //Create the table if needed.
            r.tableList().contains(table).do(function(containsTable) {
                return r.branch(
                    containsTable,
                    {created: 0},
                    r.tableCreate(table)
                );
            }).run(connection, function(err) {
                callback(err, connection);
            });
        };
    },

    close: function() {
        logger.log('info', 'Closing database connection');
        this.global.connection.close(function(err) {if (err) throw err});
        this.global.connection = null;
    }

}