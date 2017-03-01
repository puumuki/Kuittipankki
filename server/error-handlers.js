var logging = require('./logging');

/**
 * Development error handler. Will print stacktrace.
 */
function developmentErrorHandler(err, req, res, next) {
  logging.error(err);
  res.status(err.status || 500);
  res.send({
      message: err.message,
      error: err,
      title: 'error',
      stacktrace: err.stack
  });
}

/**
 * Development error handler. Will print stacktrace.
 */
function testErrorHandler(err, req, res, next) {
  logging.error("Error occurred", JSON.stringify(err));
  res.status(err.status || 500);
  res.send({
      message: err.message,
      error: err,
      title: 'error',
      stacktrace: err.stack
  });
}

/**
 * Production error handler. Will print stacktrace.
 */
function productionErrorHandler(err, req, res, next) {
  res.status(err.status || 500);
  res.send({
    message: err.message,
    error: {},
    title: 'error'
  });
}

module.exports = {
  test: testErrorHandler,
  development: developmentErrorHandler,
  production: productionErrorHandler
};
