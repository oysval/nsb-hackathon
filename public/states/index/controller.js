angular.module('nsbHackathonApp')
  .config(function ($stateProvider) {

    $stateProvider
      .state('index', {
        url: '/',
        templateUrl: 'states/index/view.ejs',
        controller: 'IndexCtrl as index'
      });

  })
  .controller('IndexCtrl', function ($scope) {

    console.log('this is from index');

  });
