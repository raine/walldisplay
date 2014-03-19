(function() {
  var app = angular.module('walldisplay');
  app.filter('firstline', function () {
    return function(text) {
      return text.split('\n')[0];
    };
  });
}());
