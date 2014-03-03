var WebSocketServer = require('ws').Server
  , express = require('express')
  , app = express()
  , _ = require('lodash')
  , http = require('http')
  , port = process.env.PORT || 3000
  , util = require('util')
  , format = util.format
  , travis = require('./lib/travis')
  , sse = require('./lib/sse')
;

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(__dirname + '/static'));
app.use(express.logger('tiny'));
app.use(app.router);

var server  = http.createServer(app);
var clients = [];

// TODO: Log build started/finished/failed whatever
app.post('/travis', function(req, res) {
  util.puts(format('incoming payload from travis %s', req.body.payload));

  travis.insert(req.body.payload).then(function() {
    broadcastJobs();
    res.send(200);
  }).catch(function(err) {
    console.error(err.stack);
    res.send(500);
  });
});

app.get('/jobs', function(req, res) {
  sse.clients.open(res);

  // TODO: doesn't work on Heroku
  req.connection.addListener('close', function() {
    sse.clients.close(res);
  }, false);

  broadcastJobs();
});

function broadcastJobs() {
  travis.recent().then(function(jobs) {
    sse.clients.broadcast({ jobs: jobs }, 'jobs');
  });
}

function ping() {
  sse.clients.broadcast({ ping: 1 }, 'ping');
}

// Pings are needed to keep the connection alive on Heroku
setInterval(ping, 10000);

server.listen(port);
console.log('Express app started on port %d', port);
