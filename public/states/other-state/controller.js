angular.module('nsbHackathonApp')
  .config(function($stateProvider) {

    $stateProvider
      .state('other-state', {
        url: '/other-state',
        templateUrl: 'states/other-state/view.ejs',
        controller: 'OtherStateCtrl as otherState'
      });

  })
  .controller('OtherStateCtrl', function ($scope) {

    console.log('this is from state other-state');

  });
