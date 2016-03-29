/* jshint camelcase: false */

'use strict';

angular.module('nsbHackathonApp')
  .service('somethingService', function() {

    this.logSomething = function () {
      console.log('something');
    };

  });
