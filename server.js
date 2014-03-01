var WebSocketServer = require('ws').Server
  , express = require('express')
  , app = express()
  , _ = require('lodash')
  , http = require('http')
  , port = process.env.PORT || 3000
  , request = require('request')
  , util = require('util')
  , format = util.format
  , travis = require('./lib/travis');

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(__dirname + '/static'));
app.use(express.logger('tiny'));
app.use(app.router);

var server = http.createServer(app);
var wss = new WebSocketServer({ server: server });
wss.on('connection', function(ws) {
  // TODO: initialize new client with jobs
  console.log('client connected');
  ws.send('hello');

  ws.on('close', function() {
    console.log('closed');
  });
});

// TODO: Log build started/finished/failed whatever
app.post('/travis', function(req, res) {
  util.puts(format('incoming payload from travis %s', req.body.payload));

  travis.putPayload(
    travis.preparePayload(req.body.payload)
  ).then(function() {
    res.send(200);
  }).catch(function(err) {
    console.error(err.stack);
    res.send(500);
  });
});

server.listen(port);
console.log('Express app started on port %d', port);
