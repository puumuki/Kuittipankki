
process.env.NODE_ENV = 'test';

const chai = require('chai');
const expect = chai.expect; // we are using the "expect" style of Chai
const request = require('supertest');
const app = require('../app');
const signIn = require('./test-helper').signIn;
const path = require('path');

function createReceipt( sign, userId ) {
  var promise = sign.agent.post('/receipt');

  promise.set('Accept', 'application/json');
  promise.send({
    "user_id": userId,
    "files": [],
    "name": "Testi",
    "store": "Anttila",
    "warrantlyEndDate": "2017-02-24 00:00:00",
    "registered": "2017-02-02 00:00:00",
    "purchaseDate": "2017-02-25 00:00:00",
    "tags": ["Mursu"],
    "description": "DesuDesu",
    "price": "3000"
  });
  promise.expect('Content-Type', /json/);
  promise.expect(200);

  return promise;
}

describe("Test /file route endpoints", function() {

  it("POST /upload - Try upload image wihtout authentications -> 403 ", function(done) {
    request(app)
      .post('/upload')
      .type('form')
      .expect(403, done);
  });

  it("POST /upload/blaablaa -> Try to uload image to non existing endpoints -> 404", function(done) {
    request(app)
      .post('/upload/blaablaa')
      .type('form')
      .expect(404, done);
  });

  it("DELETE /upload -> Try to delete image wihtout authentication -> 403", function(done) {
    request(app)
      .delete('/picture/blaablaa')
      .expect(403, done);
  });

  /*
  it("DELETE /upload -> Try to delete image that is not yours -> 403", function(done) {

    sign.promise.then((req, res) =>{

      sign.agent.put('/upload')
        .send()
        .end(function(err, res) {

        });
    });
  });
  */


  it("POST /upload -> Upload image with authentication succesfully -> 204", function(done) {

    var filename = 'helloworld.txt';
    var filePath = path.join( __dirname, filename );

    let sign = signIn(app);

    sign.promise.then((req) => {

      var userId = req.body.id;

        var promise = createReceipt( sign, userId );

        promise.end( ( req2, res2) => {

          expect( !!res2.body.id ).equal(true);//Receipt ID founds

          var req = sign.agent.post('/upload');

          req.buffer(false);

          req.set('receipt-id', res2.body.id );
          req.set('Content-Type', 'multipart/form-data; boundary=----WebKitFormBoundaryr72cRGpmATx7zSPe;');
          req.set('Accept-Encoding', 'gzip, deflate, br');
          req.set('X-Requested-With', 'XMLHttpRequest');
          req.set('Content-Length', '195');
          req.set('Accept', 'application/json');
          req.set('Connection', 'keep-alive');
          req.set('Cache-Control', 'no-cache');
          req.set('Accept-Encoding', 'gzip, deflate, br');
          req.set('Accept-Language', 'en-US,en;q=0.8,fi;q=0.6');

          req.attach('file', filePath, filename);

          req.end(function(err, res) {
            expect( res.status ).equal(204);//No Content
            done();
          });

        });//End of creating receipt object

    });//End of signing in

  });


  it("POST /upload -> Upload image with authentication user to to non existing receipt -> 404", function(done) {

    var filename = 'helloworld.txt';
    var filePath = path.join( __dirname, filename );

    let sign = signIn(app);

    sign.promise.then((req) => {

      var userId = req.body.id;

        var promise = createReceipt( sign, userId );

        promise.end( ( req2, res2) => {

          expect( !!res2.body.id ).equal(true);//Receipt ID founds

          var req = sign.agent.post('/upload');

          req.buffer(false);

          req.set('receipt-id', 'wrong-receipt-id' );
          req.set('Content-Type', 'multipart/form-data; boundary=----WebKitFormBoundaryr72cRGpmATx7zSPe;');
          req.set('Accept-Encoding', 'gzip, deflate, br');
          req.set('X-Requested-With', 'XMLHttpRequest');
          req.set('Content-Length', '195');
          req.set('Accept', 'application/json');
          req.set('Connection', 'keep-alive');
          req.set('Cache-Control', 'no-cache');
          req.set('Accept-Encoding', 'gzip, deflate, br');
          req.set('Accept-Language', 'en-US,en;q=0.8,fi;q=0.6');

          req.attach('file', filePath, filename);

          req.end(function(err, res) {
            expect( res.status ).equal(404);//Receipt don't exist
            expect( res.body.message ).equal('Receipt wrong-receipt-id not found');
            done();
          });

        });//End of creating receipt object

    });//End of signing in

  });

  it("POST /upload -> Upload image with authentication user to another user's receipt, 401 - Unauthorized", function(done) {

    var filename = 'helloworld.txt';
    var filePath = path.join( __dirname, filename );

    let ressuSign = signIn(app, 'Ressu', 'salakala');

    ressuSign.promise.then((req) => {

      var userId = req.body.id;

        var promise = createReceipt( ressuSign, userId );

        promise.end( ( req2, res2) => {

          expect( !!res2.body.id ).equal(true);//Receipt ID founds

          //Sign as a Teemu
          var teemuSign = signIn( app, 'teemuki', 'salakala');

          teemuSign.promise.then(() => {
            //Try to upload a file with an user id's
            var req3 = teemuSign.agent.post('/upload');

            req3.buffer(false);

            req3.set('receipt-id', res2.body.id );
            req3.set('Content-Type', 'multipart/form-data; boundary=----WebKitFormBoundaryr72cRGpmATx7zSPe;');
            req3.set('Accept-Encoding', 'gzip, deflate, br');
            req3.set('X-req3uested-With', 'XMLHttpreq3uest');
            req3.set('Content-Length', '195');
            req3.set('Accept', 'application/json');
            req3.set('Connection', 'keep-alive');
            req3.set('Cache-Control', 'no-cache');
            req3.set('Accept-Encoding', 'gzip, deflate, br');
            req3.set('Accept-Language', 'en-US,en;q=0.8,fi;q=0.6');

            req3.attach('file', filePath, filename);

            req3.end(function(err, res4) {
              expect( res4.status ).equal(401);//Receipt is not owned by Teemumi, it's Ressu's receipt
              expect( res4.body.message ).equal('Not authorized, you have no access to upload image to this receipt');
              done();
            });
          });//End of teemuki sign in

        });//End of creating receipt object

    });//End of signing in

  });



});
