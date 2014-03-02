var WebSocketServer = require('ws').Server
  , express = require('express')
  , app = express()
  , _ = require('lodash')
  , http = require('http')
  , port = process.env.PORT || 3000
  , request = require('request')
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
    travis.recent().then(function(jobs) {
      broadcast({ jobs: jobs }, 'jobs');
    });

    res.send(200);
  }).catch(function(err) {
    console.error(err.stack);
    res.send(500);
  });
});

app.get('/jobs', function(req, res) {
  handleOpen(res);
  req.connection.addListener('close', _.partial(handleClose, res), false);

  travis.recent().then(function(jobs) {
    broadcast({ jobs: jobs }, 'jobs');
  });
});

server.listen(port);
console.log('Express app started on port %d', port);

function handleOpen(res) {
  clients.push(res);
  sse.head(res);
  console.log('connection opened.', clientsCount());
}

function handleClose(res) {
  clients = _.without(clients, res);
  console.log('connection closed.', clientsCount());
}

function clientsCount() {
  return format('clients: %d', clients.length);
}

function broadcast(obj, type) {
  console.log(format('broadcasting to %d client(s).', clients.length))

  _.forEach(clients, function(res) {
    sse.send(res, obj, type);
  });
}

var sse = {};

