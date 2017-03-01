/**
 * Module holds test function used in testing Kuittipankki server.
 */
const request = require('supertest');
const _       = require('underscore');

/**
 * Makes sign in and return a authenticated request. This can be used
 * to test request endpoint that need authentication. Return an object
 * that has a two attributes, agent and promise. Promise is resolved when a
 * user is authenticated and so on used to place to continue testing.
 *
 * @param {object} app, kuittipankki app.js module as it's
 * @return {object} agent object and promise object
 */
function signIn(app, username, password ) {

    var credentials = _.defaults({username: username, password: password},
                                 {username:'teemuki', password: 'salakala'});

    var agent = request.agent(app);

    var promise = agent.post('/login')
                       .type('form')
                       .set('Content-Type','application/x-www-form-urlencoded; charset=UTF-8')
                       .send({'username':credentials.username})
                       .send({'password':credentials.password});

    return {
      agent: agent,
      promise: promise
    };
}

module.exports = {
  signIn: signIn
};
