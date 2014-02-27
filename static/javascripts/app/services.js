'use strict';

(function() {
  var app = angular.module('walldisplay');
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

  app.service('FakeSocket', function($timeout) {
    var jobsFixture = [
      {
        name: 'front master',
        started: ago(5),
        finished: ago(3),
        status: 'success',
        previous: {
          started: ago(1001),
          finished: ago(1000),
          status: _.sample(['fail', 'success'])
        }
      },
      {
        name: 'front develop',
        started: ago(5),
        finished: ago(3),
        status: 'success',
        previous: {
          started: ago(1001),
          finished: ago(1000),
          status: _.sample(['fail', 'success'])
        }
      }
    ];

    var jobs;
    function FakeSocket() {}

    FakeSocket.prototype = new EventEmitter();
    FakeSocket.prototype.start = function() {
      jobs = jobsFixture;
      this.update(jobs);
      $timeout(loop, 1000);
    };

    FakeSocket.prototype.update = function(jobs) {
      // console.log(JSON.stringify(jobs, null, 4));
      this.emit('message', { jobs: _.cloneDeep(jobs) });
    };

    function loop() {
      startBuild(jobs[0]);
      fs.update(jobs);
      $timeout(function() {
        finishBuild(jobs[0]);
        fs.update(jobs);
      }, 100000);
    }

    var fs = new FakeSocket();
    return fs;
  });

  function startBuild(job) {
    job.previous.started  = job.started;
    job.previous.finished = job.finished;
    job.status  = 'pending';
    job.started = now();
    delete job.finished
  }

  function finishBuild(job) {
    job.status = _.sample(['success', 'fail']);
    job.finished = now();
  }

  function job(name) {
    return {
      name: name,
      started: ago(60),
      finished: now(),
      status: 'success',
      previous: {
        started: ago(3000),
        finished: ago(2940),
        status: _.sample(['fail', 'success'])
      }
    };
  }

  function now() {
    return (new Date).toISOString();
  }

  function ago(secs) {
    return (new Date(Date.now() - secs * 60 * 1000)).toISOString();
  }

  app.factory('animate', function($window, $rootScope) {
    var requestAnimationFrame = $window.requestAnimationFrame ||
      $window.mozRequestAnimationFrame ||
      $window.msRequestAnimationFrame ||
      $window.webkitRequestAnimationFrame;

    return function(tick) {
      requestAnimationFrame(function() {
        $rootScope.$apply(tick);
      });
    };
  });
})();

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
