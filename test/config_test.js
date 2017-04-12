module.exports = {
    rethinkdb: {
        host: 'localhost',
        port: 28015,
        authKey: '',
        db: 'redsandtest'
    },
    express: {
        port: 3000
    },
    password: {
        saltRounds: 10
    },
    logging: {
        level: 'debug'
    },
    secretKey: 'secret-key'
};