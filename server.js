var express = require('express');
var http = require('http');
var path = require('path');
var app = express();

// assets
app.use(express.static(path.join(__dirname, 'public'), {}));
app.use(express.static(path.join(__dirname, 'public/dist'), {}));

// ejs view engine
app.set('view engine', 'ejs');
app.set('views', __dirname + '/public/dist');

// routes
app.use('/', require('./routes/index'));

// launch http server
var port = process.env.PORT || 1338;
var server = http.createServer(app);

server.listen(port, function() {
  console.log('Server running on port ' + port + '.');
});
