'use strict';

var app = angular.module('walldisplay', []);

app.controller('JobCtrl', function($scope, $timeout) {
  $scope.jobs = _.range(4).map(function() { return dummyJob() });

  // $timeout(function() {
  //   $scope.jobs = _.rest($scope.jobs);
  // }, 1000)
});

app.directive('job', function($window) {
  var jobs = [];

  function recalcHeights() {
    _.invoke(jobs, 'recalcHeight');
  }

  angular.element($window).bind('resize', recalcHeights);

  return {
    templateUrl: 'job.html',
    restrict: 'E',
    scope: {

    },
    link: function(scope, element) {
      var $container = element.find('.job-container');
      var $text      = element.find('h1');

      jobs.push(element);
      $text.fitText();

      scope.job = {
        name: 'front master'
      };

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
      });
    }
  };
});

function dummyJob() {
  return {
    name: 'front master'
  };
}
