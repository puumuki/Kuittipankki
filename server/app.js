var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var exphbs  = require('express-handlebars');
var expressValidator = require('express-validator');

var uploads = require('./routes/upload');
var routes = require('./routes/index');
var users = require('./routes/user');
var receipts = require('./routes/receipts');
var settings = require('./settings');

var app = express();

var env = process.env.NODE_ENV || 'development';
app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env == 'development';

console.info("Starting app in " + env + " mode." );

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

app.use( expressValidator() );

app.use(cookieParser());
app.use(express.static(path.join(__dirname,'..', 'ui')));
app.use('/pictures', express.static(path.join(__dirname,'pictures')));

app.use('/', uploads);
app.use('/', routes);
app.use('/', users);
app.use('/', receipts);


//TODO validointi, autentikointi
//https://github.com/flosse/json-file-store



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
