var WebSocketServer = require('ws').Server
  , express = require('express')
  , app = express()
  , _ = require('lodash')
  , http = require('http')
  , Promise = require('bluebird')
  , port = process.env.PORT || 3000
  , mongo = require('./lib/mongo');

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
  var payload = JSON.parse(req.body.payload);

  mongo.connect().then(function(db) {
    var coll = db.collection('travis_payloads');
    return coll.insertAsync(payload).then(function() {
      res.send(200);
    });
  }).catch(function(err) {
    console.error(err.stack);
    res.send(500);
  });
});

server.listen(port);
console.log('Express app started on port %d', port);
