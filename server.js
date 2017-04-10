var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var jwt = require('jsonwebtoken');
var logger = require('winston');
var passwordService = require('./service/password_service');
var config = require('./config.js');
var dbSetup = require('./data/db');
var userDao = require('./data/user_dao');
var orgDao = require('./data/org_dao');
var tokenService = require('./service/token_service');
var _ = require('lodash');

logger.level = config.logging.level;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.get('/', function(req, res){
    res.send('Hello! This is Red Sand Authentication API. Nothing to do here');
});

var secretKey = 'secret_key';

var apiRoutes = express.Router();

apiRoutes.post('/auth', function(req, res) {
    var login = req.body.login;
    var password = req.body.password;

    userDao.findByLogin(login, function(err, user) {

        if (err || !user) {
            logger.log('warn', 'login not authorized for user %s', login);
            res.status(403).json(createResponseAsJson(false, 'UNAUTHORIZED'));
        } else {
            var response;
            var match = passwordService.matches(password, user.password);

            if (match == true) {
                orgDao.findByOrgId(user.org_id, function(err, org) {
                    var expiry = "24h";
                    if (org) {
                        expiry = org.tokenExpiration;
                    }
                    //signs and returns the token
                    var token = tokenService.generate(user, secretKey, expiry);

                    // returns the information including token as JSON
                    response = createResponseAsJson(true, 'OK');
                    response.token = token;
                    res.json(response);
                });

            } else {
                res.status(403).json(createResponseAsJson(false, 'UNAUTHORIZED'));
            }
        }
    });
});

apiRoutes.post('/validate', function(req, res) {
    var user = req.body.user;
    var token = req.body.token;

    if (!token) {
        res.status(403).send('Invalid body');
        return;
    }

    tokenService.validateAndDecode(token, secretKey, function(err, decoded) {
        if (err) {
            res.status(403).send(err);
            return;
        }

        if (user) {
            if (_.isEqual(decoded.user, user)) {
                res.status(204).send();
            } else {
                res.status(403).send();
            }
        } else {
            res.status(204).send();
        }
    });

});

var apiAdminRoutes = express.Router();

/*
apiAdminRoutes.use(function(req, res, next) {

    // check header or url parameters or post parameters for token
    var token = req.body.token || req.query.token || req.headers['x-access-token'];

    // decode token
    if (token) {

        // verifies secret and checks exp
        jwt.verify(token, 'secret_key', function (err, decoded) {
            if (err) {
                return res.json({success: false, message: 'Failed to authenticate token.'});
            } else {
                // if everything is good, save to request for use in other routes
                req.decoded = decoded;
                next();
            }
        });

    } else {

        // if there is no token
        // return an error
        return res.status(403).send({
            success: false,
            message: 'No token provided.'
        });

    }
});
*/

var createResponseAsJson = function(isSuccess, message) {
    return {
        success: isSuccess,
        message: message
    };
}

apiAdminRoutes.get('/user/:orgid', function(req, res) {
    userDao.findByOrgId(req.params.orgid, function(err, users) {
       if (err) {
           console.log(err);
           res.json(createResponseAsJson(false, 'Can not retrieve the users by organization id \n'+err));
       } else {
           var response = createResponseAsJson(true, 'OK');
           response.value = users;
           res.json(response);
       }
    });
});

apiAdminRoutes.post('/user', function(req, res) {
    var user = req.body;

    userDao.loginExists(user.login).then(function(exists) {

        if (exists) {
            logger.log('warn', 'Can not create user. Login %s already exists', user.login);
            res.json(createResponseAsJson(false, 'LOGIN_EXISTS'));
            return;
        }

        user.password = passwordService.encrypt(user.password, config.password.saltRounds);
        userDao.save(user, function(err, result) {
            if (err) {
                logger.log('err', err);
                res.json(createResponseAsJson(false, 'Can not create user. \n'+err));
            } else {
                res.json(createResponseAsJson(true, 'CREATED'));
            }
        });
    });
});

apiAdminRoutes.put('/user', function(req, res) {
    //update a user
});

apiAdminRoutes.delete('/user/:id', function(req, res) {
    //deletes a user
});

apiAdminRoutes.post('/org', function(req, res) {
    var org = req.body;
    orgDao.save(org, function(err, result) {
       if (err) {
           res.status(500).json(createResponseAsJson(false, 'Can not create org. \n'+err));
           return;
       }

       res.json(createResponseAsJson(true, 'CREATED'));
    });
});

app.use('/api', apiRoutes);
app.use('/admin', apiAdminRoutes);

//App startup
dbSetup.init(config, function(err, connection) {

    logger.log('debug', 'App config: %s', JSON.stringify(config));

    if (err) {
        console.error(err);
        process.exit(1);
        return;
    }

    dbSetup.global.connection = connection;
    app._rdbCon = connection;
    app.listen(config.express.port);
    console.log('Server started on port ' + config.express.port);
});

