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
var bDevMode = false;
var drawings;
var app;

var development = {
  port: 8181
};

var production = {
  port: 80
}

app = connect();

drawings = [];

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

// Post here when something is drawn to the screen
app.use(
  '/draw',
  function (req, res, next)
  {
    switch (req.method)
    {
      case "GET":
        res.write("Cannot GET /draw, weirdo!");
        res.end();
        return;
        break;
      case "POST":
        if (req.body.drawing)
        {
          drawings.push(req.body.drawing)
        }
        break;
    }

    res.write("OK");
    res.end();
  });

// Get all current drawings
app.use(
  '/drawings.json',
  function (req, res, next)
  {
    switch (req.method)
    {
      case "GET":
        res.write(JSON.stringify(drawings));
        res.end();
        return;
        break;
      case "POST":
        res.write("Cannot POST /drawings, weirdo!");
        res.end();
        return;
        break;
    }

    res.write("OK");
    res.end();
  });

// If no other route hit, attempt to serve static stuff
app.use(serveStatic(__dirname + '/public'))

// Okay, start'r up!
try {
  app.listen(bDevMode ? development.port : production.port);  
} catch (e) {
  console.error("EACCESS: Try again as super or switch to dev mode.");
}
