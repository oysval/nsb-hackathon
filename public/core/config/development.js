'use strict';

angular.module('nsbHackathonApp')
  .provider('config', function () {
    var config = {
      something: 'something'
    };
    return {
      $get: function () { return config; },
      get: function () { return config; }
    };
  });
