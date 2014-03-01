var WebSocketServer = require('ws').Server
  , express = require('express')
  , app = express()
  , _ = require('lodash')
  , http = require('http')
  , port = process.env.PORT || 3000
  , request = require('request')
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

app.post('/travis', function(req, res) {
  travis.putPayload(
    travis.preparePayload(req.body.payload)
  );
});

server.listen(port);
console.log('Express app started on port %d', port);
