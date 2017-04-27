const logger = require('winston');
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
var helmet = require('helmet');
var session = require('express-session');
var favicon = require('serve-favicon');
var path = require('path')
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
var orgUiListRoute = require('./route/ui/admin/org/org_list');
var orgUiCreateEditRoute = require('./route/ui/admin/org/org_edit');
var userUiListRoute = require('./route/ui/admin/user/user_list');
var userUiCreateEditRoute = require('./route/ui/admin/user/user_edit');
var tokenService = require('./service/token_service');
var loginAuth = require('./route/ui/admin/login');

logger.level = config.logging.level;

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(session({
    resave: false, // don't save session if unmodified
    saveUninitialized: false, // don't create session until something stored
    secret: config.secretKey
}));
app.use(favicon(path.join('views','public','img', 'favicon.ico')));
app.set('views', __dirname+'/views');
app.set('view engine', 'ejs');

app.use(morgan('dev'));
app.use(helmet());

app.get('/api', function(req, res) {
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

//Activates the json web token filter for production environment
// if (process.env.NODE_ENV === 'production') {
    adminRoutes.use(jwtFilter);
// }

adminRoutes.post('/user', function(req, res) {
    createUserRoute(req, res);
});

adminRoutes.put('/user/:id', function(req, res) {
    updateUserRoute(req, res);
});

adminRoutes.delete('/user/:id', function(req, res) {
    deleteUserRoute(req, res);
});

adminRoutes.get('/user/org/:orgid', function(req, res) {
    usersByOrgRoute(req, res);
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

// UI mappings
var uiRoutes = express.Router();

function restrict(req, res, next) {
    var loggedUser = req.session.user;
    if (loggedUser && tokenService.isValid(loggedUser.token, config.secretKey)) {
        logger.log('debug', 'User contains valid token');
        next();
    } else {
        logger.log('error', 'User not authorized');
        req.session.error = 'Access denied!';
        res.redirect('/ui/admin/login');
    }
}

uiRoutes.get('/admin/login', function(req, res) {
    res.render('admin/login.ejs');
});

uiRoutes.post('/admin/login/auth', function(req, res) {
    loginAuth(req, res, function(err, result) {
        if (err) {
            res.status(403).render('admin/login.ejs', err);
            return;
        }

        res.json({success: true, message: result});
    });
});

uiRoutes.get('/admin/logout', function(req, res) {
    req.session.destroy(function(){
        res.redirect('/ui/admin/login')
    });
});

uiRoutes.get('/admin', restrict, function(req, res) {
    res.render('admin/index');
});

uiRoutes.get('/admin/org', restrict, function(req, res) {
    orgUiListRoute(req, res);
});

uiRoutes.get('/admin/org/create', restrict, function(req, res) {
    orgUiCreateEditRoute(req,res);
});

uiRoutes.get('/admin/org/edit/:id', restrict, function(req, res) {
    orgUiCreateEditRoute(req,res);
});

uiRoutes.get('/admin/user', restrict, function(req, res) {
    userUiListRoute(req, res);
});

uiRoutes.get('/admin/user/create', restrict, function(req, res) {
    userUiCreateEditRoute(req,res);
});

uiRoutes.get('/admin/user/edit/:id', restrict, function(req, res) {
    userUiCreateEditRoute(req,res);
});

app.use('/api', apiRoutes);
app.use('/admin', adminRoutes);
app.use('/ui', uiRoutes);
app.use('/js', express.static('views/js'));
app.use('/css', express.static('views/css'));
app.use('/img', express.static('views/public/img'));

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