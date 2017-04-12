const logger = require('winston');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var morgan = require('morgan');
var config = require('./config.js');
var dbSetup = require('./data/db');
var authRoute = require('./route/api/auth_route');
var validateRoute = require('./route/api/validate_route');
var usersByOrgRoute = require('./route/admin/user/users_by_org_route');
var createUserRoute = require('./route/admin/user/create_user_route');
var updateUserRoute = require('./route/admin/user/update_user_route');
var deleteUserRoute = require('./route/admin/user/delete_user_route');
var createOrgRoute = require('./route/admin/org/create_org_route');
var updateOrgRoute = require('./route/admin/org/update_org_route');
var deleteOrgRoute = require('./route/admin/org/delete_org_route');
var jwtFilter = require('./filter/jwt_filter');

logger.level = config.logging.level;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());

app.use(morgan('dev'));

app.get('/', function(req, res){
    res.send('Hello! This is Red Sand Authentication API.');
});

var apiRoutes = express.Router();

apiRoutes.post('/auth', function(req, res) {
    authRoute(req, res)
});

apiRoutes.post('/validate', function(req, res) {
    validateRoute(req, res);
});

var adminRoutes = express.Router();

if (process.env.NODE_ENV === 'PROD') {
    adminRoutes.use(jwtFilter);
}

adminRoutes.get('/user/org/:orgid', function(req, res) {
    usersByOrgRoute(req, res);
});

adminRoutes.post('/user', function(req, res) {
    createUserRoute(req, res);
});

adminRoutes.put('/user/:id', function(req, res) {
    updateUserRoute(req, res);
});

adminRoutes.delete('/user/:id', function(req, res) {
    deleteUserRoute(req, res);
});

adminRoutes.post('/org', function(req, res) {
    createOrgRoute(req, res);
});

adminRoutes.put('/org/:id', function(req, res) {
    updateOrgRoute(req, res);
});

adminRoutes.delete('/org/:id', function(req, res) {
   deleteOrgRoute(req, res);
});

app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);

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