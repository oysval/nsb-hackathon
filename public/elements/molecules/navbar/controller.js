'use strict';

angular.module('nsbHackathonApp')
  .controller('navbarDirectiveCtrl', function ($scope, $state) {

    $scope.currentState = $state.current.name;

    $scope.navElements = [
      {
        title: 'index',
        state: 'index'
      },
      {
        title: 'other state',
        state: 'other-state'
      }
    ];

  })
  .directive('navbar', function () {
    return {
      restrict: 'E',
      controller: 'navbarDirectiveCtrl',
      templateUrl: 'elements/molecules/navbar/view.ejs',
      scope: {

      }
    };
  });
