//Running:
//jasmine-node .
var frisby = require('frisby');

/* Testataan kuitin tallentamista */

var receipt = {
  "picture": "sfldkjd-safjlkasj-asdjkfkla",
  "name": "Kello",
  "store": "EYEWAX",
  "warrantlyEndDate": "2015-07-20 08:43:48",
  "registered": "2014-06-28 03:57:41",
  "tags":[
  "et",
    "officia",
    "do"
  ],
  "created": "2015-12-01 01:16:57",
  "updated": "2014-12-05 10:59:43",
  "purchaseDate": "2014-12-05 10:59:43"
};

frisby.create('Tallenna kuitti')
  .post('http://localhost:8080/receipt', receipt)
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON({
  "picture": "sfldkjd-safjlkasj-asdjkfkla",
  "name": "Kello",
  "store": "EYEWAX",
  "warrantlyEndDate": "2015-07-20 08:43:48",
  "registered": "2014-06-28 03:57:41",
  "tags":[
    "et",
    "officia",
    "do"
  ],
  "created": "2015-12-01 01:16:57",
  "updated": "2014-12-05 10:59:43",
  "purchaseDate": "2014-12-05 10:59:43"
}).after(function(err,res, body) {

  var responseJSON = JSON.parse( res.toJSON().body );

  frisby.create('Hae tallennettu kuitti')

  .get('http://localhost:8080/receipt/'+responseJSON.id)
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON({
    "picture": "sfldkjd-safjlkasj-asdjkfkla",
    "name": "Kello",
    "store": "EYEWAX",
    "warrantlyEndDate": "2015-07-20 08:43:48",
    "registered": "2014-06-28 03:57:41",
    "tags":[
      "et",
      "officia",
      "do"
    ],
    "created": "2015-12-01 01:16:57",
    "updated": "2014-12-05 10:59:43",
    "purchaseDate": "2014-12-05 10:59:43"
  }).after(function(err, res, body) {
    
    var responseJSON = JSON.parse( res.toJSON().body );

    frisby.create('Pävitä tallennetun/haetun kuitin tietoja')

    .put('http://localhost:8080/receipt/' + responseJSON.id, {
      "picture": "234234-32423sdfa-324234",
      "name": "namename",
      "store": "waxwax",
      "warrantlyEndDate": "2015-07-20 08:43:48",
      "registered": "2014-06-28 03:57:41",
      "tags":[
        "et"
      ],
      "created": "2015-12-01 01:16:57",
      "updated": "2014-12-05 10:59:43",
      "purchaseDate": "2014-12-05 10:59:43"
    })

    .expectStatus(200)
    .expectHeaderContains('content-type', 'application/json')
    .expectJSON({
      "picture": "234234-32423sdfa-324234",
      "name": "namename",
      "store": "waxwax",
      "warrantlyEndDate": "2015-07-20 08:43:48",
      "registered": "2014-06-28 03:57:41",
      "tags":[
        "et"
      ],
      "created": "2015-12-01 01:16:57",
      "updated": "2014-12-05 10:59:43",
      "purchaseDate": "2014-12-05 10:59:43"
    }).toss();//End of Pävitä tallennetun/haetun kuitin tietoja

  })
  .toss();//End of Hae tallennettu kuitti
      
})
.toss()//End of Tallenna kuitti;

frisby.create('Hae kaikki kuitit')
  .get('http://localhost:8080/receipts')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
.toss();

frisby.create('Hae kuitti')
  .get('http://localhost:8080/receipt/854f42ef-ecf5-45a7-8b33-f587c4700fde')
  .expectStatus(200)
  .expectHeaderContains('content-type', 'application/json')
  .expectJSON({
    "picture": "http://placehold.it/32x32",
    "name": "Kello",
    "store": "EYEWAX",
    "warrantlyEndDate": "2015-07-20 08:43:48",
    "registered": "2014-06-28 03:57:41",
    "tags":[
    "et",
      "officia",
      "do"
    ],
    "created": "2015-12-01 01:16:57",
    "updated": "2014-12-05 10:59:43",
    "purchaseDate": "2014-12-05 10:59:43"
    })
.toss();