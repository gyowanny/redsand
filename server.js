var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
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

apiAdminRoutes.put('/user/:id', function(req, res) {
    var id = req.params.id;

    userDao.findById(id, function(err, userFound) {
        if (err) {
            logger.log('Can not find user by ID [%s] \n %s', id, err);
            res.json(createResponseAsJson(false, 'Can not find user by ID. \n'+err));
            return;
        }

        if (!user) {
            res.status(403).json(createResponseAsJson(false, 'User not found'));
            return;
        }

        var user = req.body;
        if (!user.id) {
            user.id = id;
        }

        userDao.save(user, function (err, result) {
            if (err) {
                logger.log('Can not update user with ID [%s] \n %s', id, err);
                res.json(createResponseAsJson(false, 'Can not update user with ID. \n'+err));
                return;
            }

            res.json(createResponseAsJson(true, 'UPDATED'));
        });
    })
});

apiAdminRoutes.delete('/user/:id', function(req, res) {
    //deletes a user by id. Safer than by login
    userDao.delete(req.params.id, function(err, result) {
       if (err) {
           logger.log('err', 'Can not delete user ID %s', req.params.id);
           res.status(500).json(createResponseAsJson(false, err));
           return;
       }

       res.json(createResponseAsJson(result === 'DELETED', result));
    });
});

apiAdminRoutes.post('/org', function(req, res) {
    var org = req.body;

    orgDao.orgIdExists(org.org_id).then(function(exists) {

        if (exists) {
            logger.log('warn', 'Can not create org. Org ID %s already exists', org.org_id);
            res.json(createResponseAsJson(false, 'ORG_ID_EXISTS'));
            return;
        }

        orgDao.save(org, function(err, result) {
            if (err) {
                res.status(500).json(createResponseAsJson(false, 'Can not create org. \n'+err));
                return;
            }

            res.json(createResponseAsJson(true, 'CREATED'));
        });
    });

});

apiAdminRoutes.put('/org/:id', function(req, res) {

    var id = req.params.id;

    orgDao.findById(id, function(err, org) {

        if(err) {
            logger.log('Can not find org by ID [%s] \n %s', id, err);
            res.status(403).json(createResponseAsJson(false, 'Can not find org by ID. \n'+err));
            return;
        }

        if (!org) {
            res.status(403).json(createResponseAsJson(false, 'Org not found'));
            return;
        }

        var org = req.body;

        if(!org.id) {
            org.id = id;
        }

        orgDao.save(org, function(err, result) {
            if (err) {
                logger.log('Can not update org with ID [%s] \n %s', id, err);
                res.json(createResponseAsJson(false, 'Can not update org with ID. \n'+err));
                return;
            }

            res.json(createResponseAsJson(true, 'UPDATED'));
        });
    });

});

apiAdminRoutes.delete('/org/:id', function(req, res) {
    //deletes an org by id. Safer than by login
    var id = req.params.id;
    orgDao.delete(id, function(err, result) {
        if (err) {
            logger.log('err', 'Can not delete user ID %s', id);
            res.status(500).json(createResponseAsJson(false, err));
            return;
        }

        res.json(createResponseAsJson(result === 'DELETED', result));
    });
});

app.use('/api', apiRoutes);
app.use('/admin', apiAdminRoutes);

// Shutdown hook
// process.on('SIGINT', function() {
//     logger.log('info', 'Closing database connection');
//     dbSetup.close();
// });

//App startup
dbSetup.init(config, function(err, connection) {

    logger.log('debug', 'App config: %s', JSON.stringify(config));

    if (err) {
        console.error(err);
        process.exit(1);
        return;
    }

    dbSetup.global.connection = connection;
    app.listen(config.express.port);
    logger.log('info', 'Server started on port %s', config.express.port);
});

