module.exports = {
    rethinkdb: {
        host: 'localhost',
        port: 28015,
        authKey: '',
        db: 'redsand'
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
    secretKey: process.env.SECRET_KEY
};