var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var jwt = require('jsonwebtoken');
var passwordService = require('./service/password_service');

var port = process.env.PORT || 7000;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.get('/', function(req, res){
    res.send('Hello! This is Red Sand Authentication API.');
});

var apiRoutes = express.Router();

apiRoutes.post('/auth', function(req, res) {
    var login = req.body.login;
    var password = req.body.password;

    var user; //TODO: from database

    var match = passwordService.matches(password, user.password);
    if (match == true) {
       //authenticate and returns the token
       var token = jwt.sign(user, 'secret_key', {
           expiresInMinutes: 1440 // expires in 24 hours
       });

       // return the information including token as JSON
       res.json({
           success: true,
           message: 'Enjoy your token!',
           token: token
       });
    } else {
       res.json({
           success: false,
           message: 'Authentication failed'
       })
    }
});

var apiAdminRoutes = express.Router();
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


apiAdminRoutes.get('/user/:orgid', function(req, res) {
    //returns the list of all users of the given organization id
});

apiAdminRoutes.post('/user', function(req, res) {
    //create a user
});

apiAdminRoutes.put('/user', function(req, res) {
    //update a user
});

apiAdminRoutes.delete('/user/:id', function(req, res) {
    //deletes a user
});

app.use('/api', apiRoutes);
app.use('/admin', apiAdminRoutes);

app.listen(port);
console.log('Server started on port ' + port);
