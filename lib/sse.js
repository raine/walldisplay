var format = require('util').format
  , _ = require('lodash')
;

var head =  exports.head = function(res) {
  res.writeHead(200, {
    'Content-Type'  : 'text/event-stream',
    'Cache-Control' : 'no-cache',
    'Connection'    : 'keep-alive'
  });

  res.write("retry: 10000\n");
}

var send = exports.send = function(res, obj, type) {
  if (type) res.write(format('event: %s\n', type));
  res.write('data: ' + JSON.stringify(obj) + '\n\n');
};

var clients = [];
exports.clients = {
  open: function(res) {
    clients.push(res);
    head(res);
    console.log('connection opened.', ccount());
  },
  close: function(res) {
    clients = _.without(clients, res);
    console.log('connection closed.', ccount());
  },
  broadcast: function(obj, type) {
    console.log(format('broadcasting to %d client(s).', clients.length))

    _.forEach(clients, function(res) {
      send(res, obj, type);
    });
  }
};

function ccount() {
  return format('clients: %d', clients.length);
}
