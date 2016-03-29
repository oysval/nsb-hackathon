/* jshint camelcase: false */

angular.module('nsbHackathonApp', [
    'ui.router',
    'angularMoment',
  ])
  .config(function($urlRouterProvider) {

    $urlRouterProvider.otherwise('/');

  });
