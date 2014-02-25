'use strict';

app.controller('JobCtrl', function($scope, $timeout, Socket) {
  $scope.jobs = [];

  Socket.on('message', function() {
    console.log(arguments)
  });
});
