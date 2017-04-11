process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../app');

describe("Testing /login route",function() {

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

});
