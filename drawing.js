/*- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -*/
/*| 
/*|  Drawing experiment
/*| 
/*|    A drawing experiment where users of website can draw, and see others work
/*|    right on the webpage itself.
/*|   
/*|  Author: [Reed](https://github.com/reedspool)
/*|   
/*|  Usage
/*|    require('./drawing')(connectApp)
/*|
/*- -~- -*/
module.exports = function (app)
{
  var drawings = [];
  var fs = require('fs');

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
            drawings.push(req.body.drawing);
            fs.writeFile(
              './drawings/' + (new Date().toUTCString()) + '.json',
              JSON.stringify(drawings));
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
}