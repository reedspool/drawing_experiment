/*- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -~- -*/
/*
/*  Drawing Experiment (Client Side)
/* 
/*  1) Send drawings I make to server
/*  2) Draw recordings I receive from server
/*
/*  Author: [Reed](https://github.com/reedspool)
/*
/*  Dependencies: jQuery
/*
/*- -~- -*/
// Make a new canvas as a widget
var $canvas = $('<canvas id="drawSpaceCanvas"></canvas>');
var ctx;
var current = { x: 0, y: 0 };
var all = [];
var bDrawing = false;

// Align the canvas resolution to drawing space by explicit height/width attrs
$canvas.attr('width', $('article').width());
$canvas.attr('height', $('article').height());

// Also hack the visual height/width of the canvas. Can't get this working with CSS
$canvas.css('height', $('article').height());
$canvas.css('width', $('article').width());

// Add our widget to the page
$('#drawSpace').append($canvas);

// Get drawing context
ctx = $canvas.get(0).getContext('2d');

// When the user clicks down, start drawing
$('body').on('mousedown', function (evt, i) {
  bDrawing = true;

  var x = evt.pageX;
  var y = evt.pageY;

  // Set the starting position
  current = { x: x, y: y };

  // Store the beginning of the line.
  all.push(current);
});

// When the user releases click
$('body').on('mouseup', function (evt, i) {
  var msg;

  // Stop drawing
  bDrawing = false;

  // If any data significant data was collected...
  if (all.length >= 3)
  {
    msg = all.map(function (d) { return d.x + ' ' + d.y }).join(' ')

    $.post('/draw', { drawing: msg })
      .then(console.log('Drawing sent: ' + msg))
  }

  // Either way, dump out our data (don't store small stuff)
  all = [];
});

// When the mouse moves over the page, draw and record
$('body').on('mousemove', function (evt, i) {
  // If not drawing, do nothing
  if ( ! bDrawing ) return;

  var x = evt.pageX;
  var y = evt.pageY;

  ctx.beginPath();

  // Start at previous point
  ctx.moveTo(current.x, current.y);

  // Update current
  current = { x: x, y: y };

  // Draw a line between last and now
  ctx.lineTo(current.x, current.y);

  // // quadratic curve
  // ctx.quadraticCurveTo(230, 200, 250, 120);

  // // bezier curve
  // ctx.bezierCurveTo(290, -40, 300, 200, 400, 150);

  ctx.lineWidth = 5;
  ctx.strokeStyle = 'blue';

  // Then finalize the stroke on the canvas
  ctx.stroke();

  // Record the new thing
  all.push(current);
});

function drawLine(x1, y1, x2, y2) {
  
  ctx.beginPath();

  // Start at previous point
  ctx.moveTo(x1, y1);
  
  // Draw a line between last and now
  ctx.lineTo(x2, y2);

  // Then finalize the stroke on the canvas
  ctx.stroke();
}

// Retrieve drawings from server
$.get('/drawings.json')
  .then(function (drawings) {
    drawings = 
      JSON.parse(drawings)
        .map(function (d) {
          var cur = [];
          var x = '';
          var y = '';
          var flag = false;

          // Begin parsing the drawing string
          for (var i = 0; i < d.length; i++) {
            if (d[i] == ' ') {
              // Have we hit the space in between x and y yet?
              if (flag) {
                // Ya, so this is our point.
                // Validate it real quick
                if (isNaN(parseInt(x, 10)) || isNaN(parseInt(y, 10)))
                {
                  throw new Error('Malformed numbers in string: ' + x + ' ' + y + ' in ' + d)
                }
                cur.push({x:parseInt(x, 10), y: parseInt(y, 10)})

                // Reset everything
                x = '';
                y = '';
                flag = false;
              }
              else
              {
                // This is the space between x and y
                flag = true;
              }
            }
            else
            {
              // Have we hit the space in between x and y yet?
              if (flag)
              {
                y+=d[i];
              }
              else
              {
                x+=d[i];
              }
            }
          }

          if (x != '' && y != '')
          {
            // Add final one
            cur.push({x:parseInt(x, 10), y: parseInt(y, 10)})

          }
          else 
          {
            // If one of them is still unempty, Equiv of XOR
            if (x != '' || y != '') {
              throw new Error('Malformed string: ' + d)

            }
          }

          return cur;
        });

    for (var i = 0; i < drawings.length; i++)
    {
      for (var j = 0; j < (drawings[i].length - 1); j++)
      {
        drawLine(drawings[i][j].x, drawings[i][j].y,
                  drawings[i][j + 1].x, drawings[i][j + 1].y);
      }
    }

    // Pass along for no good reason
    return drawings;
  })
  .then(console.log.bind(console, 'Drawings: '));