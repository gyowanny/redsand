var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var jwt = require('jsonwebtoken');
var passwordService = require('./service/password_service');
var config = require('./config.js');
var dbSetup = require('./data/db');
var userDao = require('./data/user_dao');

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.get('/', function(req, res){
    res.send('Hello! This is Red Sand Authentication API. Nothing to do here');
});

var apiRoutes = express.Router();

apiRoutes.post('/auth', function(req, res) {
    var login = req.body.login;
    var password = req.body.password;

    userDao.findByLogin(login, function(err, user) {
        var response;
        if (err || !user) {
            response = createResponseAsJson(false, 'UNAUTHORIZED');
        } else {
            var match = passwordService.matches(password, user.password);

            if (match == true) {
                //authenticate and returns the token
                var token = jwt.sign(user, 'secret_key', {
                    expiresIn: "24h" // expires in 24 hours
                });

                // returns the information including token as JSON
                response = createResponseAsJson(true, 'OK');
                response.token = token;

            } else {
                response = createResponseAsJson(false, 'UNAUTHORIZED');
            }
        }
        res.json(response);
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
            console.log('Login '+user.login+' already exists');
            res.json(createResponseAsJson(false, 'LOGIN_EXISTS'));
            return;
        }

        user.password = passwordService.encrypt(user.password, config.password.saltRounds);
        userDao.save(user, function(err, result) {
            if (err) {
                console.log(err);
                res.json(createResponseAsJson(false, 'Can not create user. \n'+err));
            } else {
                console.log(result);
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

app.use('/api', apiRoutes);
app.use('/admin', apiAdminRoutes);

//App startup
dbSetup.init(config, function(err, connection) {
    console.log('App config: \n'+JSON.stringify(config));
    if(err) {
        console.error(err);
        process.exit(1);
        return;
    }
    dbSetup.global.connection = connection;
    app._rdbCon = connection;
    app.listen(config.express.port);
    console.log('Server started on port ' + config.express.port);
});

