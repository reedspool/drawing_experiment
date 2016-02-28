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
var $canvas = $('<canvas id="wholePageCanvas"></canvas>');
var ctx;
var last = { x: 0, y: 0 };
var all = [];

// Set the canvas resolution (whole page) by explicit height/width attributes
$canvas.attr('width', $(document).width());
$canvas.attr('height', $(document).height());

// Also hack the visual height of the canvas. Can't get this working with CSS
$canvas.css('height', $(document).height());

// Add our widget to the page
$('body').append($canvas);

// Get drawing context
ctx = $canvas.get(0).getContext('2d');

// When the mouse moves over the page, draw and record
$('body').on('mousemove', function (evt, i) {
  var x = evt.pageX;
  var y = evt.pageY;

  ctx.beginPath();
  ctx.moveTo(last.x, last.y);

  // line 1
  ctx.lineTo(x, y);

  // // quadratic curve
  // ctx.quadraticCurveTo(230, 200, 250, 120);

  // // bezier curve
  // ctx.bezierCurveTo(290, -40, 300, 200, 400, 150);

  // // line 2
  // ctx.lineTo(500, 90);

  ctx.lineWidth = 5;
  ctx.strokeStyle = 'blue';
  ctx.stroke();


  last = { x: x, y: y };
  all.push(last);
});

// Retrieve drawings from server
$.get('/drawings.json')
  .then(console.log.bind(console, 'Drawings: '));

$.post('/draw', { drawing: 'like 5' })