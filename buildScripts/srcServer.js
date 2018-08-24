// Start Express server by running 'node buildScripts/srcServer.js'.
// Type 'Ctrl+c' to stop the service.
// Start localtunnel by running 'lt --port 3001 --subdomain chay'.

var express = require('express');
var path = require('path');
var open = require('open');

var port = 3001;
var app = express();

app.get('/', function (req, res) {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/explorer.html', function (req, res) {
  res.sendFile(path.join(__dirname, '../explorer.html'));
});

// Option A: Explicit Route for main.js.
// TODO: Not working. May work with CSS.
// app.get('/scripts/main.js', function(req, res) {
//     res.sendFile(path.join(__dirname, 'scripts/main.js'));
//   });

// Option B: Designate one or more sub folders as static containers.
app.use(express.static('public'));
//app.use(express.static('scripts'));

app.listen(port, function (err) {
  if (err) {
    console.log(err);
  } else {
    open('http://localhost:' + port);
  }
});
