'use strict';

(function() {
  var app = angular.module('walldisplay');

  app.service('Source', function() {
    function Source() {
      var self = this;
      var es = new EventSource('/jobs');

      es.onopen = function(ev) {
        console.debug('opened eventsource', ev.target.url);
      };

      es.onerror = function(ev) {
        if (ev.target.readyState === EventSource.CLOSED) {
          es.close();
        }
      };

      es.addEventListener('jobs', function(ev) {
        self.emit('jobs', JSON.parse(ev.data));
      });

      es.addEventListener('ping', function(ev) {
        console.log('got ping');
      });
    }

    Source.prototype = new EventEmitter();
    return new Source;
  });

  app.service('FakeSource', function($timeout) {
    var jobsFixture = [
      {
        name: 'front master',
        started: ago(10),
        finished: ago(3),
        status: 'success',
        previous: {
          started: ago(1010),
          finished: ago(1000),
          status: failOrSuccess()
        }
      },
      {
        name: 'front develop',
        started: ago(20),
        finished: ago(5),
        status: 'success',
        previous: {
          started: ago(1010),
          finished: ago(1000),
          status: failOrSuccess()
        }
      },
      {
        name: 'api master',
        started: ago(7),
        finished: ago(4),
        status: 'success',
        previous: {
          started: ago(1010),
          finished: ago(1000),
          status: failOrSuccess()
        }
      }
    ];

    function FakeSource(fixture) {
      var self  = this;
      this.jobs = fixture;

      $timeout(function() {
        self.loop();
      });
    }

    FakeSource.prototype = new EventEmitter();
    FakeSource.prototype.update = function(jobs) {
      // console.log(JSON.stringify(jobs, null, 4));
      this.emit('jobs', { jobs: _.cloneDeep(jobs) });
    };

    FakeSource.prototype.loop = function() {
      var self = this;
      var done = _.filter(this.jobs, notPending);
      var job  = _.sample(done);
      if (job) {
        startBuild(job);
        this.update(this.jobs);

        $timeout(function() {
          finishBuild(job);
          self.update(self.jobs);
        }, lastDuration(job));
      };

      $timeout(this.loop.bind(this), 5000);
    };

    return new FakeSource(jobsFixture);
  });

  function startBuild(job) {
    job.previous.status   = job.status;
    job.previous.started  = job.started;
    job.previous.finished = job.finished;
    job.status  = 'pending';
    job.started = now();
    delete job.finished
  }

  function finishBuild(job) {
    job.status   = failOrSuccess();
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
        status: failOrSuccess()
      }
    };
  }

  function lastDuration(job) {
    return new Date(job.previous.finished) - new Date(job.previous.started);
  }

  function notPending(job) {
    return job.status !== 'pending';
  }

  function now() {
    return (new Date).toISOString();
  }

  function ago(secs) {
    return (new Date(Date.now() - secs * 1000)).toISOString();
  }

  function failOrSuccess() {
    return _.sample(['fail', 'success']);
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
