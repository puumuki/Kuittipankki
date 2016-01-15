var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs  = require('express-handlebars');
var expressValidator = require('express-validator');
var passport = require('passport');
var expressSession = require('express-session')
var picture = require('./routes/picture');
var routes = require('./routes/index');
var users = require('./routes/user');
var receipts = require('./routes/receipts');
var settings = require('./settings');
var authentication = require('./authentication');
var _ = require('underscore');
var logging = require('./logging');

//Session are stored by default to .session file
var FileStore = require('session-file-store')(expressSession);

var app = express();

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

logging.info("Starting app in " + env + " mode." );

passport.use(authentication.authenticationStrategy);

passport.serializeUser(authentication.serializeUser);
passport.deserializeUser(authentication.deserializeUser);

// view engine setup

app.engine('handlebars', exphbs({
  defaultLayout: 'main',
  partialsDir: ['views/partials/']
}));

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'handlebars');

// app.use(favicon(__dirname + '/public/img/favicon.ico'));
app.use(logger('combined'));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: true
}));

app.use(expressSession({ store: new FileStore(), secret: 'ads32432afdsf' }));

app.use(passport.initialize());
app.use(passport.session());

app.use(expressValidator() );

app.use(cookieParser());

app.use(express.static(path.join(__dirname,'..', 'ui')));

app.use('/pictures', express.static(path.join(__dirname,'pictures')));

app.use('/', picture);
app.use('/', routes);
app.use('/', users);
app.use('/', receipts);

app.get('/logout', function(req, res){
  req.logout();
  res.send({message:'Session terminated'});
});

app.post('/login',
  passport.authenticate('local', {failureFlash: false}),  
  // If this function gets called, authentication was successful.
  // `req.user` contains the authenticated user.
  authentication.loginRouteResponse
);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            title: 'error'
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        title: 'error'
    });
});


module.exports = app;
