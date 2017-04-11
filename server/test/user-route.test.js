
process.env.NODE_ENV = 'test';

const chai = require('chai');
const expect = chai.expect; // we are using the "expect" style of Chai
const request = require('supertest');
const app = require('../app');

const signIn = require('./test-helper').signIn;

describe("Testing /user route endpoints",function() {

  it("/POST login - authenticate user -> 200", function(done) {
    request(app)
      .post('/login')
      .type('form')
      .set('Content-Type','application/x-www-form-urlencoded; charset=UTF-8')
      .send({'username':'teemuki'})
      .send({'password':'salakala'})
      .expect(200, done);
  });

  it("/POST login - pass only username-> 400 (bad request) ", function(done) {
    request(app)
      .post('/login')
      .type('form')
      .set('Content-Type','application/x-www-form-urlencoded; charset=UTF-8')
      .send({'username':'teemuki'})
      .send({'password':''})
      .expect(400, done);
  });

  it("/POST login - no attributes -> 400 (bad request) ", function(done) {
    request(app)
      .post('/login')
      .type('form')
      .set('Content-Type','application/x-www-form-urlencoded; charset=UTF-8')
      .expect(400, done);
  });

  it("/POST login - pass username and password wihtout value -> 400 (bad request) ", function(done) {
    request(app)
      .post('/login')
      .type('form')
      .set('Content-Type','application/x-www-form-urlencoded; charset=UTF-8')
      .send({'username':''})
      .send({'password':''})
      .expect(400, done);
  });

  it("/GET users - fetch all users informations, without signing in -> 403 ", function(done) {
    request(app)
      .get('/users')
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(403, done);
  });

  it('/GET users - fetch all user informations -> 200', function(done) {
      var sign = signIn( app );
      sign.promise.then(function() {
        sign.agent.get('/users')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200, done);
      });
  });

  it('/GET user - fetch user informations, without signing in -> 403 ', function(done) {
      request(app).get('/user/asdfasdf+dsfasdfsd+sdaf')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(403, done);
  });

  it('/GET user - fetch user informations -> 200', function(done) {
      var sign = signIn( app );

      sign.promise.then(function(req) {

        var userId = req.body.id;

        sign.agent.get('/user/'+userId)
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200, done);
      });
  });


  it("/PUT user information, without signing in -> 403", function(done) {
      request(app).put('/user/asdfasdf+dsfasdfsd+sdaf')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(403, done);
  });

  it('/PUT user information, update user language to finnish -> 200', function(done) {

      var sign = signIn( app );

      sign.promise.then((req, res) =>{

        sign.agent.put('/user/'+req.body.id)
          .send({
            "id":"9b3f9c97-b710-4610-9609-738a950044e2",
            "username":"teemuki",
            "lang":"fi"
          })
          .end(function(err, res) {

            expect( res.status ).equal(200);
            expect( res.body.id ).equal( req.body.id );
            expect( res.body.username ).equal( 'teemuki' );
            expect( res.body.lang ).equal( 'fi' );

            done();
          });
      });
  });

  it('/PUT user information, update user language to english -> 200', function(done) {

      var sign = signIn( app );

      sign.promise.then((req, res) =>{

        sign.agent.put('/user/'+req.body.id)
          .send({
            "id":"9b3f9c97-b710-4610-9609-738a950044e2",
            "username":"teemuki",
            "lang":"en"
          })
          .end(function(err, res) {

            expect( res.status ).equal(200);
            expect( res.body.id ).equal( req.body.id );
            expect( res.body.username ).equal( 'teemuki' );
            expect( res.body.lang ).equal( 'en' );

            done();
          });
      });
  });

  it('/PUT user information, lang attribute missing -> 400 ', function(done) {

      var sign = signIn( app );

      sign.promise.then((req, res) =>{

        sign.agent.put('/user/'+req.body.id)
          .send({
            "id":"9b3f9c97-b710-4610-9609-738a950044e2",
            "username":"teemuki",
           })
          .end(function(err, res) {
            expect( res.body.errors.length > 0 ).equal(true);
            expect( res.status ).equal(400);
            done();
          });
      });
  });


  it("/PUT user information, update user that don't exist -> 404", function(done) {

      var sign = signIn( app );

      sign.promise.then((req, res) =>{

        sign.agent.put('/user/'+"3213vdsfasd")
          .send({
            "id":"9b3f9c97-b710-4610-9609-738a950044e3",
            "username":"teemuki",
            "lang":"en"
          })
          .end(function(err, res) {
            expect( res.status ).equal(404);
            done();
          });
      });

  });

  it("/GET userauthenticated -> 200", function(done) {
      var sign = signIn( app );

      sign.promise.then((req) => {
        sign.agent.get('/userauthenticated')
          .end(function(err, res) {
            expect( res.status ).equal(200);
            done();
          });
      });
  });

  it("/GET userauthenticated, without signing in -> 403", function(done) {
    request(app)
          .get('/userauthenticated')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(403, done);
  });

});
