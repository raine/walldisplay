'use strict';

(function() {
  var app = angular.module('walldisplay');
  app.directive('job', function($window, $timeout, $interval, animate) {
    var jobs = [];

    function recalcHeights() {
      _.invoke(jobs, 'recalcHeight');
    }

    angular.element($window).bind('resize', recalcHeights);

    return {
      templateUrl: 'job.html',
      restrict: 'E',
      scope: {
        job: '=data'
      },
      link: function(scope, element) {
        scope.jobClass = jobClass;
        var $container = element.find('.job-container');
        var $text      = element.find('h1');
        var job        = scope.job;

        jobs.push(element);
        $text.fitText();

        element.recalcHeight = function() {
          var pct = 100 / jobs.length;
          $container.height(pct + '%');

          var height = $container.height();
          $text.css({
            height     : height,
            lineHeight : height + 'px'
          });
        };

        recalcHeights();

        scope.$on('$destroy', function() {
          jobs = _.without(jobs, element);
          recalcHeights();
        });

        (function tick() {
          if (job.status === 'pending') {
            var lastDur = new Date(job.previous.finished) - new Date(job.previous.started);
            var elapsed = new Date() - new Date(job.started)
            var width   = elapsed / lastDur * 100

            job.progress = width;
          }

          animate(tick);
        })();

        /*
         * scope.$watch('job', function(val, old) {
         *   var job = scope.job;
         *   console.log(job.name, job.status);
         *   // Job started
         *   if (job.status === 'pending') {
         *     progressLoop();
         *   }
         * }, true);
         */

      }
    };
  });

  function jobClass(job) {
    if (job.previous) {
      return job.previous.status;
    } else {
      return 'first';
    }
  }
})();
