/*- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -*/
/*| 
/*|  Server for Drawing Experiment
/*| 
/*|    A drawing experiment where users of website can draw, and see others work
/*|    right on the webpage itself.
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
var app;

app = connect();

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

app.use(
  '/draw',
  function (req, res, next)
  {
    switch (req.method)
    {
      case "GET":
          console.log("Draw GET: ", req, req.body);
        break;
      case "POST":
          console.log("Draw POST: ", req, req.body);
        break;
    }

    res.write("OK");
    res.end();
  });

// If no other route hit, attempt to serve static stuff
app.use(serveStatic(__dirname + '/public'))

// Okay, start'r up!
app.listen(8181);