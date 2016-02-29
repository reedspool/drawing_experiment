/*- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -*/
/*| 
/*|  Basic Flexible Server for AWS
/*| 
/*|    A modular server running on connect
/*|   
/*|  Author: [Reed](https://github.com/reedspool)
/*|   
/*|  Setup 
/*|    `npm install connect serve-static body-parser cookie-session compression`
/*|
/*|  Run
/*|    node app.js
/*|
/*- -~- -*/
var connect = require('connect');
var serveStatic = require('serve-static');
var compression = require('compression');
var cookieSession = require('cookie-session');
var bodyParser = require('body-parser');
var bDevMode = false;
var app;

var development = {
  port: 8181
};

var production = {
  port: 80
}

app = connect();

// Check mode
if (process.argv[2] && process.argv[2].match("dev"))
{
  // If Dev mode requested
  bDevMode = true;
}

/**
 * Middleware (each is reached on every request)
 */

// gzip/deflate outgoing responses
app.use(compression());

// store session state in browser cookie
app.use(cookieSession(
  {
      keys: ['secret1', 'secret2']
  }));

// parse urlencoded request bodies into req.body
app.use(bodyParser.urlencoded());

/**
 * Routes (may not continue)
 */

// Include routes from drawing app
require('./drawing')(app);

// If no other route hit, attempt to serve static stuff
app.use(serveStatic(__dirname + '/public'))

// Okay, start'r up!
try {
  app.listen(bDevMode ? development.port : production.port);  
} catch (e) {
  console.error("EACCESS: Try again as super or switch to dev mode.");
}
