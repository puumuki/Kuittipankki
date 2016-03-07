//Running:
//jasmine-node user-rest-spec.js

var frisby = require('frisby');

/* Testataan käyttäjän tallentamista  */
frisby.create('Tallenna käyttäjä')

.post('http://localhost:9090/user',{
  "username": "TeemukiTest",
  "password": "salakala",
})
.expectStatus(200)
.expectHeaderContains('content-type', 'application/json')
.after(function(err, res, body) {

  frisby.create('Autentikoi käyttäjä')
  .post('http://localhost:9090/login', {
    "username": "TeemukiTest",
    "password": "salakala"
  })
  .addHeader(
    'Content-Type','application/x-www-form-urlencoded; charset=UTF-8'
  )
  .expectStatus(200)
  .after(function(err, res, body) {

    var cookie = res.headers['set-cookie'];

    var responseJSON = JSON.parse( res.toJSON().body );

    frisby.create('Pävitä käyttäjän tietoja autentikoimatta')
     .put('http://localhost:9090/user/' + responseJSON.id, {
        "username": "TeemuPeemu",
        "password": "halikala",
     })  
     .expectStatus(403)
     .toss();

    frisby.create('Hae tallennettu käyttäjä ID:llä')

    .get('http://localhost:9090/user/' + responseJSON.id )
    .addHeader('cookie', cookie)
    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON({
      "username": "TeemukiTest",
      "id": responseJSON.id
    })
    
    .after(function(err, res, body) {
      
      frisby.create('Pävitä käyttäjän tietoja')

      .put('http://localhost:9090/user/' + responseJSON.id, {
        "username": "TeemuPeemu",
        "password": "halikala",
      })
      .addHeader('cookie', cookie)
      .expectStatus(200)
      .expectHeaderContains('content-type', 'application/json')
      .expectJSON({
        "username": "TeemuPeemu",
        "id":  responseJSON.id
      }).toss();//End of käyttäjän päivitys
      
    }).toss();//End of käyttäjän haku
    
  }).toss();//End of käyttäjän tallennus

  /**
   *Koita käyttää ohjelmaa autentikoimatta
   */
  frisby.create('Hae tallentamatonta käyttäjää')
    .get('http://localhost:9090/user/TeemukiTest')
    .expectStatus(403)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON({})
  .toss();

  frisby.create('Hae autentikoitunut käyttäjä')
    .get('http://localhost:9090/userauthenticated')
    .expectStatus(403)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON({})
  .toss();

  frisby.create('Hae kaikki käyttäjät')
    .get('http://localhost:9090/users')
    .expectStatus(500)//Tämän pitäisi palvelun tulisi olla disabloituna
  .toss();

}).toss();//End of authentication
