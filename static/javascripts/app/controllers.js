'use strict';

app.controller('JobCtrl', function($scope, $timeout, FakeSocket) {
  $scope.jobs = [];

  FakeSocket.on('message', function(data) {
    $scope.jobs = data.jobs;
  });

  FakeSocket.start();
});
