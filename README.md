## Kuittipankki

Kuittipankki is a storage for receipts, it stores your receipt and meta information related to it. It keep your receipts and purchases well organized. Easy and fast search helps you to find your old receipt when you need them.

Responsive GUI gives you a possibility to access the site with your phone, tablet or desktop comptuter with a browser.

Start server with running node server/index.js

### Setting Up
```
# Clone repository
git clone https://github.com/puumuki/Kuittipankki.git

# Setting up UI side
cd Kuittipankki/ui
npm install
bower install

# Setting up server side
cd Kuittipankki/server
npm install

# Starting application
node index.js
```


### Project Structure

The project is divided to two main directories `server` and `ui` where most of the application logic are hold. 

```
teemuki-4:kuittipankki teemuki1$ tree -d -L 2
.
├── robot-test -- Robot Framework Tests
├── scripts
│   └── backupper -- Simple script back up data
├── server
│   ├── bin -- Is this relevant anymore??
│   ├── data -- User information, receipt information and other data stored here
│   ├── fonts -- Some font server to UI side
│   ├── logs -- Server logs can be found here
│   ├── public -- Are these anymore needed?
│   ├── routes -- All routes, HTTP-request "interfaces"
│   ├── schemas -- JSON schemas
│   ├── sessions -- user session objects are stored here
│   ├── test
│   └── uploaded-files
├── sessions
└── ui
    ├── css -- CSS styles for UI
    ├── libs -- Some customized JS libraries
    ├── prod -- Directory where minimized UI end up
    ├── scripts -- All the UI logic can found here
    ├── templates -- Minimal reusable or utility handlebars template stuff
    └── test -- Small amount of units test for UI side
```


### Server Tests
There is a group server side test for testing most of the server REST interfaces. These can be simply runned by a by mocha test runned, most of the testes are implemented by using the supertest. To run all the test navigate to server directory `cd server`, after that just run `mocha`, this will run all the test that can be found from tests directory. 

````bash
cd server
mocha .
````


### UI Test
There are small number UI side test that can be found from `ui/test` directory. These test are runned in a browser enviroment. You can use Google Chrome or Firefox, witch one suit you the best. 

````bash
cd ui
http-server .
````
Open a browser and navigate to http://localhost:8080/test-runner.html, all UI side test are runned in a browser currently. These test should be a part of a build process, but they are not cause I  had small difficulties to run unit test on the terminal.


