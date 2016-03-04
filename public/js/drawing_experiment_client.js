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
var current;
var all = [];
var bDrawing = false;
var segmentsQueue = [];
var segmentsToBeAddedQueue = [];
var DRAW_LENGTH = 60;
var DOWNTIME = 50;
var MAX_STROKES_IN_PLAY = 5;
var allStrokes = new Queue();

var widthCanvas = $('article').width();
var heightCanvas = $('article').height()

// Align the canvas resolution to drawing space by explicit height/width attrs
$canvas.attr('width', widthCanvas);
$canvas.attr('height', heightCanvas);

// Also hack the visual height/width of the canvas. Can't get this working with CSS
$canvas.css('height', heightCanvas);
$canvas.css('width', widthCanvas);

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

  // Add to total drawings on page (in reverse)
  for (i = all.length - 2; i >= 0 ; i--) {
    // Violating my own "Queue" rule, be cute by plopping their drawing
    // at the beginning of the "to disappear" list.
    segmentsQueue.push([all[i].x, all[i].y, all[i+1].x, all[i+1].y]);
  }

  // Dump out our data now that it's committed
  all = [];
});

// When the mouse moves over the page, draw and record
$('body').on('mousemove', function (evt, i) {
  // If not drawing, pass along the event to others
  if ( ! bDrawing ) return true;

  var x = evt.pageX;
  var y = evt.pageY;

  // Draw the line the user just drew
  drawLine(current.x, current.y, x, y);

  // Update current
  current = { x: x, y: y };

  // Record the new thing
  all.push(current);
});

// Retrieve drawings from server
$.get('/drawings.json')
  .then(function (drawings) {
    // Parse JSON, then transform drawing string into objects
    drawings = JSON.parse(drawings).map(parseDrawing);

    // Shuffle all drawings
    shuffle(drawings);

    for (var i = 0; i < drawings.length; i++)
    {
      for (var j = 0; j < (drawings[i].length - 1); j++)
      {
        addLineSegment(drawings[i][j].x, drawings[i][j].y,
                  drawings[i][j + 1].x, drawings[i][j + 1].y);
      }
    }

    // Pass along for no good reason
    return drawings;
  })
  .then(function (drawings) {
    // Set up a timer
    setInterval(function () {
      // Draw at the correct time
      requestAnimationFrame(function () {
        // Move stuff along
        step();

        // Paint the canvas
        draw();
      })
    }, DOWNTIME);
  })
  .then(console.log.bind(console, 'Drawings: '));

function drawLine(x1, y1, x2, y2) {
  
  ctx.beginPath();

  ctx.lineWidth = 5;
  ctx.strokeStyle = 'blue';

  // Start at previous point
  ctx.moveTo(x1, y1);

  // // quadratic curve
  // ctx.quadraticCurveTo(230, 200, 250, 120);

  // // bezier curve
  // ctx.bezierCurveTo(290, -40, 300, 200, 400, 150);
  
  // Draw a line between last and now
  ctx.lineTo(x2, y2);

  // Then finalize the stroke on the canvas
  ctx.stroke();
}

// TODO: What am I doing here
function addLineSet(segments) {
  allLineSets.push(segments);
}

function addLineSegment(x1, y1, x2, y2) {
  // Insert an array containing the beginning and end points at front
  // Conveniently, this array is the exact signature for drawLine ;)
  segmentsToBeAddedQueue.unshift([x1, y1, x2, y2])
}

function stepStrokes() {
  // First, for each stroke in play, "slide" it over by one
  inPlayStrokes.forEach(function (stroke)
  {
    stroke.slide();
  });

  // Then, check if any strokes fell out (or if we just revving up)
  if (inPlayStrokes.length < MAX_STROKES_IN_PLAY)
  {
    // Yes, so add another stroke.
    if (nextStrokesQueue.size() > 0)
    {
      inPlayStrokes.insert(nextStrokesQueue.dequeue());
    }
  }
}

function step() {
  // If there are any segments to be added...
  if (segmentsToBeAddedQueue.length > 0) {
    // TODO: Maybe time for a dedicated Queue object?
    segmentsQueue.unshift(segmentsToBeAddedQueue.pop())
  }

  // If we're over our limit, or there's nothing more to be added...
  if (segmentsQueue.length > DRAW_LENGTH || segmentsToBeAddedQueue.length == 0) {
    // Remove the last line segment
    segmentsQueue.pop();
  }
}

function drawStrokes() {
  // Clear the canvas
  ctx.clearRect(0, 0, widthCanvas, heightCanvas);

  // First, for each stroke in play, "slide" it over by one
  inPlayStrokes.forEach(function (stroke)
  {
    stroke.getActive().forEach(function (segments)
    {
      drawLine.apply(null, segment);
    });
  });

  // Draw each line
  segmentsQueue.forEach(function (segment, i) {
    // A segment is an array "[x1, y1, x2, y2]", the signature of drawline
    drawLine.apply(null, segment);
  });

  // Draw each line segment currently being drawn
  all.forEach(function (segment, i) {
    // Do not draw last segment
    if (i == all.length -1) return;

    // Draw this segment, to the next one
    drawLine(segment.x, segment.y, all[i+1].x, all[i+1].y);
  });
}

function draw() {
  // Clear the canvas
  ctx.clearRect(0, 0, widthCanvas, heightCanvas);

  // Draw each line
  segmentsQueue.forEach(function (segment, i) {
    // A segment is an array "[x1, y1, x2, y2]", the signature of drawline
    drawLine.apply(null, segment);
  });

  // Draw each line segment currently being drawn
  all.forEach(function (segment, i) {
    // Do not draw last segment
    if (i == all.length -1) return;

    // Draw this segment, to the next one
    drawLine(segment.x, segment.y, all[i+1].x, all[i+1].y);
  });
}


/**
 * Static functions
 */


// Mini queue class
function Queue()
{
  // Fake private storage
  this.__arr = [];
}

Queue.prototype.insert = function (item)
{
  this.__arr.unshift(item);
}

Queue.prototype.dequeue = function ()
{
  return this.__arr.pop();
}

Queue.prototype.size = function ()
{
  return this.__arr.length;
}

/**
 * Shuffle Taken from
 * http://stackoverflow.com/questions/6274339/how-can-i-shuffle-an-array-in-javascript
 * 
 * Shuffles array in place.
 * @param {Array} a items The array containing the items.
 * @return {Array} a The shuffled array
 */
function shuffle(a) {
    var j, x, i;
    for (i = a.length; i; i -= 1) {
        j = Math.floor(Math.random() * i);
        x = a[i - 1];
        a[i - 1] = a[j];
        a[j] = x;
    }
}

// Straightforward parsing of drawing strings "x1 y1 x2 y2 ..."
function parseDrawing(d) {
  var cur = [];
  var x = '';
  var y = '';
  var flag = false;

  // Begin parsing the drawing string
  for (var i = 0; i < d.length; i++) {
    if (d[i] == ' ') {
      // Have we hit the space in between x and y yet?
      if (flag) {
        // Yes, so that was the final space btwn points. Validate it real quick
        if (isNaN(parseInt(x, 10)) || isNaN(parseInt(y, 10)))
        {
          throw new Error('Malformed numbers in string: ' + x + ' ' + y + ' in ' + d)
        }

        // All good, add it.
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
    // If one of them is still unempty, Equiv of x XOR y
    if (x != '' || y != '') {
      throw new Error('Malformed string: ' + d);
    }
  }

  return cur;
}