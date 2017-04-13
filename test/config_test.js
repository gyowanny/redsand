module.exports = {
    rethinkdb: {
        host: 'localhost',
        port: 37250,
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
    secretKey: 'secret-key',
    defaultTokenExpiration: '24h'
};