var JSV = require("JSV").JSV;

/**
 * Create a schema validator middleware function than
 * can be passed to a route to validate incoming request.
 * @param {object} JSON schema object
 * @return {function} middleware function
 */
function schemaValidatorMiddleware( schema ) {
  var jsvEnviroment = JSV.createEnvironment();

  return function( req, res, next ) {

    var report = jsvEnviroment.validate( req.body, schema );

    if( report.errors.length > 0 ) {
      return res.status(400).send({
        message: "JSON-validation failed validate against schema",
        errors: report.errors,
        data: req.body
      });
    } else {
      next();
    }
  }
}

module.exports = schemaValidatorMiddleware;
