var WebSocketServer = require('ws').Server
  , express = require('express')
  , app = express()
  , _ = require('lodash')
  , http = require('http')
  , port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded());
app.use(express.static(__dirname + '/static'));
app.use(express.logger('tiny'));
app.use(app.router);

var server = http.createServer(app);
server.listen(port);
console.log('Express app started on port %d', port);

var wss = new WebSocketServer({ server: server });
wss.on('connection', function(ws) {
  // TODO: initialize new client with jobs
  console.log('client connected');
  ws.send('hello');

  ws.on('close', function() {
    console.log('closed');
  });
});

jobs = [
  {
    name    : 'front master',
    status  : 'pending',
    started : '2014-02-23T11:50:54.054Z'
  },
  {
    name     : 'front develop',
    status   : 'failed',
    started  : '2014-02-23T11:50:54.054Z',
    finished : '2014-02-23T11:52:54.054Z'
  },
  {
    name     : 'front develop',
    status   : 'passed',
    started  : '2014-02-23T11:50:54.054Z',
    finished : '2014-02-23T11:52:54.054Z'
  }
];
