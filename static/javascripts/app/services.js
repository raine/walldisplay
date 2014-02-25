'use strict';

app.service('Socket', function($location) {
  function Socket() {
    var self = this;
    var host = $location.$$absUrl.replace(/^http/, 'ws');
    var ws = new WebSocket(host);
    
    ws.onmessage = function(event) {
      try {
        var data = JSON.parse(event.data);
      } catch(e) {
        console.error('invalid json');
        return;
      }

      self.emit('message', data);
    };

    ws.onopen = function() {
      console.debug('opened websocket')
    }

    // ws.onopen = function(evt) { onOpen(evt) };
    // ws.onclose = function(evt) { onClose(evt) };
    // ws.onmessage = function(evt) { onMessage(evt) };
    // ws.onerror = function(evt) { onError(evt) }; 
  }

  Socket.prototype = new EventEmitter();

  return new Socket;
});

app.service('FakeSocket', function($location) {
  var jobs = [
    job('front master'),
    job('front develop')
  ];

  function Socket() {}

  Socket.prototype = new EventEmitter();
  Socket.prototype.start = function() {
    var self = this;

    this.update({ jobs: jobs });
  };

  Socket.prototype.update = function(data) {
    this.emit('message', data);
  };

  var socket = new Socket();
  return socket;
});

function job(name) {
  return {
    name: name,
    started: minuteAgo(),
    finished: now(),
    status: 'success'
  };
}

function now() {
  return (new Date).toISOString();
}

function minuteAgo() {
  return (new Date(Date.now() - 60 * 1000)).toISOString();
}


/*
 * {
 *   "jobs": [
 *       {
 *       "name": "front master",
 *       "previous": {
 *         "finished": "2014-02-23T11:53:54.054Z",
 *         "name": "front master",
 *         "started": "2014-02-23T11:50:54.054Z",
 *         "status": "finished"
 *       },
 *       "started": "2014-02-23T11:50:54.054Z",
 *       "status": "pending"
 *     },
 *     {
 *       "finished": "2014-02-23T11:53:54.054Z",
 *       "name": "front develop",
 *       "started": "2014-02-23T11:50:54.054Z",
 *       "status": "success"
 *     }
 *   ]
 * }
 */
