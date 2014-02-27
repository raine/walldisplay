'use strict';

(function() {
  var app = angular.module('walldisplay');
  app.controller('JobCtrl', function($scope, $timeout, FakeSocket) {
    $scope.jobs = [];

    FakeSocket.on('message', function(data) {
      // console.log('data', JSON.stringify(data, null, 4));
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
      // console.log('jobs', JSON.stringify($scope.jobs, null, 4));
    });

    FakeSocket.start();
  });
})();
