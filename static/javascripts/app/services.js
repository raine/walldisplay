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
