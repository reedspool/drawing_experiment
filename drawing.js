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
  var drawingsOut = "[]";

  // Read the latest file of drawings back in
  fs.readFile('./drawings.json',
    function (err, file)
    {
      // For dev, whatever if there's none there, do nothing
      // if (err) throw err;
      if (err) return;

      drawings = JSON.parse(file);

      // Set our cached output
      drawingsOut = JSON.stringify(drawings);
    });

  // Post here when something is drawn to the screen
  app.use(
    '/draw',
    function (req, res, next)
    {
      var timestamp;
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
            timestamp = new Date().toUTCString();

            // Add the new drawing to our lot
            drawings.push(req.body.drawing);

            // Reset our cached output
            drawingsOut = JSON.stringify(drawings);

            fs.writeFile(
              './drawings/' + timestamp + '.json',
              JSON.stringify(drawings),
              function (err)
              {
                if (err) throw err;

                fs.unlink('./drawings.json', 
                  function (err)
                  {
                    // Don't care about err enoent here
                    fs.symlink('./drawings/' + timestamp + '.json', './drawings.json');
                  });
              });

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
          res.write(drawingsOut);
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