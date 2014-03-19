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
      replace: true,
      templateUrl: 'job.html',
      restrict: 'E',
      scope: {
        job: '=data'
      },
      link: function(scope, element) {
        scope.jobClass = jobClass;
        var $container = element;
        var $text      = element.find('h1');
        var job        = scope.job;

        jobs.push(element);

        element.recalcHeight = function() {
          var pct = 100 / jobs.length;
          $container.css('height', pct + '%');

          var height = $container[0].clientHeight;
          $text.css({
            height     : height,
            lineHeight : height - (height * 0.05) + 'px'
          });
        };

        recalcHeights();

        scope.$on('$destroy', function() {
          jobs = _.without(jobs, element);
          recalcHeights();
        });

        (function tick() {
          if (job.status === 'pending') {
            var lastDur  = new Date(job.previous.finished) - new Date(job.previous.started);
            var elapsed  = new Date() - new Date(job.started)
            var width    = elapsed / lastDur * 100
            job.progress = width > 100 ? 100 : width;
          }

          animate(tick);
        })();
      }
    };
  });

  function jobClass(job) {
    if (job.status !== 'pending') {
      return [ job.status ];
    } else {
      return [ job.previous ? job.previous.status : 'first-build', 'in-progress' ]
    }
  }

  // HACK: Cause repaints for CSS viewport units
  (function() {
    var altcrement = -1;
    angular.element(window).bind('resize', function() {
      var html = document.querySelectorAll('html')[0];
      var currentFontSize = parseFloat(window.getComputedStyle(html)['font-size']);
      angular.element(html).css('font-size', currentFontSize + (altcrement *= -1) + 'px');
    });
  }());
})();
