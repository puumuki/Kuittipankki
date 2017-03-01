/**
 * Kuittipankki Express Server
 */
var express           = require('express');
var path              = require('path');
var util              = require('util');

var cookieParser      = require('cookie-parser');
var bodyParser        = require('body-parser');
var expressValidator  = require('express-validator');
var passport          = require('passport');
var expressSession    = require('express-session');

var fileRouter        = require('./routes/file');
var indexRouter       = require('./routes/index');
var usersRouter       = require('./routes/user');
var receiptsRouter    = require('./routes/receipts');

var authentication    = require('./authentication');
var logging           = require('./logging');
var accessLogger      = require('./access-logger');
var errorHandlers     = require('./error-handlers');

//Session are stored by default to .session file
var FileStore = require('session-file-store')(expressSession);

var app = express();

var env = process.env.NODE_ENV ? process.env.NODE_ENV : 'development';

app.locals.ENV = env;
app.locals.ENV_DEVELOPMENT = env === 'development';

logging.info('Starting app in ' + env + ' mode.' );

//Fetch enviroment specific configurations
var settings = require('./settings');

//Logs HTTP-requests content, result looks is much like Apache's access.log
app.use(accessLogger);

passport.use(authentication.authenticationStrategy);
passport.serializeUser(authentication.serializeUser);
passport.deserializeUser(authentication.deserializeUser);

// app.use(favicon(__dirname + '/public/img/favicon.ico'));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({
  extended: true
}));

//There was little bug when a server was started from like "node ./server/index.js"
//session directory was created to root level directory, now it always stays at the server dir
var fileStorage = new FileStore({
  path: path.join(__dirname, 'sessions')
});

app.use(expressSession({ store: fileStorage, secret: 'ads32432afdsf' }));

app.use(passport.initialize());
app.use(passport.session());
app.use(expressValidator() );
app.use(cookieParser());
app.use(express.static( settings.ui_path ));

app.use('/fonts', express.static( path.join(__dirname, 'fonts') ));
app.use('/files', express.static( settings.upload_directory ));
app.use('/', indexRouter);
app.use('/', fileRouter);
app.use('/', indexRouter);
app.use('/', usersRouter);
app.use('/', receiptsRouter);

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
  res.status(404).send({
    message: util.format('Resource %s not found', req.params.filepath || req.path ),
    title: 'error',
  });
});

app.use(errorHandlers[app.get('env')]);

module.exports = app;
