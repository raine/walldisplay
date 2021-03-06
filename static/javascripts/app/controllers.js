'use strict';

(function() {
  var app = angular.module('walldisplay');
  app.controller('JobCtrl', function($scope, $timeout, Source, $window) {
    $scope.jobs = [];

    Source.on('jobs', function(data) {
      console.debug('data', JSON.stringify(data, null, 4));
      // TODO: can angular.copy be used here?

      if (_.isEmpty($scope.jobs)) {
        $scope.jobs = data.jobs;
      } else {
        _.each(data.jobs, function(updated) {
          var job = _.find($scope.jobs, { name: updated.name });
          if (job) {
            _.extend(job, updated);
          } else {
            $scope.jobs.push(updated);
          }
        });
      }

      $scope.$apply();
    });

    var init = Date.now();
    Source.on('open', function() {
      var sinceInit = Date.now() - init;
      if (sinceInit > (60 * 60 * 1000)) {
        $window.location.reload();
      }
    });
  });
})();
