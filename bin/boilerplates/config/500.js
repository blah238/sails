/**
 * Default error handler
 *
 * If an error is thrown, Sails will respond using this default error handler
 *
 * For more information on error handling in Sails/Express, check out:
 * http://expressjs.com/guide.html#error-handling
 */

module.exports[500] = function serverErrorOccurred(errors, req, res, expressErrorHandler) {

  // Ensure that `errors` is a list
  var displayedErrors = (typeof errors !== 'object' || !errors.length) ? [errors] : errors;

  // Ensure that each error is formatted correctly
  // Then log them
  for (var i in displayedErrors) {

    // Make error easier to read
    displayedErrors[i] = require('util').inspect(displayedErrors[i]);

    if (!(displayedErrors[i] instanceof Error)) {
      displayedErrors[i] = new Error(displayedErrors[i]);
    }

    sails.log.error(displayedErrors[i]);
  }

  // In production, don't display any identifying information about the error(s)
  var response = {};
  if (sails.config.environment === 'development') {
    response = {
      status: 500,
      errors: displayedErrors
    };
  }

  // If the user-agent wants a JSON response,
  // the views hook is disabled,
  // or the 500 view doesn't exist,
  // send JSON
  if (req.wantsJSON || !sails.config.hooks.views || !sails.hooks.views.middleware[500]) {

    // Create JSON-readable version of errors
    for (var j in response.errors) {
      response.errors[j] = {
        error: response.errors[j].message
      };
    }

    return res.json(response, 500);
  }


  // Otherwise
  // create HTML-readable stacks for errors
  for (var k in response.errors) {
    response.errors[k] = response.errors[k].stack;
  }

  // If it can be rendered, render the `views/500.*` page is rendered
  if (res.view) {
    return res.view('500', response);
  }

  // Fall back to the underlying Express error behavior
  return expressErrorHandler(errors);

};