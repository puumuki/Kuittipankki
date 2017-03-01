process.env.NODE_ENV = 'test';

const chai = require('chai');
const expect = chai.expect; // we are using the "expect" style of Chai
const request = require('supertest');
const app = require('../app');
const _ = require('underscore');
const signIn = require('./test-helper').signIn;

describe("Testing /receipt route endpoints", function() {

  it("GET /receipts without authentication -> 403",function(done) {
    request(app)
      .get('/receipts')
      .expect(403, done);
  });

  it("POST /receipt without authentication -> 403",function(done) {
    request(app)
      .post('/receipt')
      .expect(403, done);
  });

  it("PUT /receipt without authentication -> 403",function(done) {
    request(app)
      .put('/receipt/sdf')
      .expect(403, done);
  });

  it("GET /receipt without authentication -> 403",function(done) {
    request(app)
      .get('/receipt/desudesu')
      .expect(403, done);
  });

  it("GET /receipts without authentication -> 403",function(done) {
    request(app)
      .get('/receipts')
      .expect(403, done);
  });

  it("DELETE /receipt without authentication -> 403",function(done) {
    request(app)
      .delete('/receipt/<id>')
      .expect(403, done);
  });

  it("POST /receipt - save a new receipt", function(done) {
    request(app)
      .post('/receipt')
      .expect(403, done);
  });

  it("PUT /receipt - update a existing receipt", function(done) {
    request(app)
      .put('/receipt/<id>')
      .expect(403, done);
  });

  it("GET /receits - fetch all existing receipts", function(done) {
    let sign = signIn(app);
    sign.promise.then((req) => {

      sign.agent.get('/receipts')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(200)
          .end( (req, res) => {
            expect( _.isArray( res.body ) ).equal(true);
            done();
          })
     });
  });

  it("GET /receipt - fetch non existing receipt -> 404", function(done) {
    let sign = signIn(app);
    sign.promise.then((req) => {

      sign.agent.get('/receipt/desudesu')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .end( (req, res) => {
            expect( res.body.message ).equal('Receipt is not found with a given id desudesu');
            done();
          })
     });
  });

  it("GET /receipt - delete non existing receipt -> 404", function(done) {
    let sign = signIn(app);
    sign.promise.then((req) => {

      sign.agent.delete('/receipt/desudesu')
          .set('Accept', 'application/json')
          .expect('Content-Type', /json/)
          .expect(404)
          .end( (req, res) => {
            expect( res.body.message ).equal('Receipt is not found with a given id desudesu');
            done();
          })
     });
  });

  it("PUT /receipt - Update non existing receipt -> 404", function(done) {
    let sign = signIn(app);
    sign.promise.then((req) => {

      sign.agent.put('/receipt/desudesu')
          .set('Accept', 'application/json')
          .send({
              "user_id": "9b3f9c97-b710-4610-9609-738a950044e2",
              "files": [],
              "name": "Testi",
              "store": "Anttila",
              "warrantlyEndDate": "2017-02-24 00:00:00",
              "registered": "2017-02-02 00:00:00",
              "purchaseDate": "2017-02-25 00:00:00",
              "tags": ["Mursu"],
              "description": "DesuDesu",
              "price": "3000"
            })
          .expect('Content-Type', /json/)
          .expect(404)
          .end( (req, res) => {
            expect( res.body.message ).equal('Receipt is not found with a given id desudesu');
            done();
          });
     });
  });

  it("POST /receipt - Save a new reciept -> 200", function(done) {
    let sign = signIn(app);
    sign.promise.then((req) => {

      sign.agent.post('/receipt')
          .set('Accept', 'application/json')
          .send(
            {
              "user_id": "9b3f9c97-b710-4610-9609-738a950044e2",
              "files": [],
              "name": "Testi",
              "store": "Anttila",
              "warrantlyEndDate": "2017-02-24 00:00:00",
              "registered": "2017-02-02 00:00:00",
              "purchaseDate": "2017-02-25 00:00:00",
              "tags": ["Mursu"],
              "description": "DesuDesu",
              "price": "3000"
            }
          )
          .expect('Content-Type', /json/)
          .expect(200)
          .end( (req, res) => {
            //console.log( res.body );
            expect( res.body.user_id ).equal('9b3f9c97-b710-4610-9609-738a950044e2');
            expect( res.body.files.length ).equal(0);
            expect( res.body.name ).equal("Testi");
            expect( res.body.store ).equal("Anttila");
            expect( res.body.warrantlyEndDate ).equal("2017-02-24 00:00:00");
            expect( res.body.registered ).equal("2017-02-02 00:00:00");
            expect( res.body.purchaseDate ).equal("2017-02-25 00:00:00");
            expect( res.body.price ).equal('3000');
            done();
          });
     });
  });

  it("POST /receipt - Save a new reciept, unallowed attribute -> 403", function(done) {
    let sign = signIn(app);
    sign.promise.then((req) => {

      sign.agent.post('/receipt')
          .set('Accept', 'application/json')
          .send(
            {
              "user_id": "9b3f9c97-b710-4610-9609-738a950044e2",
              "files": [],
              "name": "Testi",
              "store": "Anttila",
              "warrantlyEndDate": "2017-02-24 00:00:00",
              "registered": "2017-02-02 00:00:00",
              "purchaseDate": "2017-02-25 00:00:00",
              "tags": ["Mursu"],
              "description": "DesuDesu",
              "price": "3000",
              "balliina": "3032"
            }
          )
          .expect('Content-Type', /json/)
          .expect(400)
          .end( (req, res) => {
            done();
          });
     });
  });


});
