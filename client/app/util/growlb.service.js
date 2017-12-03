'use strict';

function growlbService($timeout) {
  var notification = [];
  var growlB = {};
  growlB.notify = function (gType, msg) {
    growlB.msg = msg;
    growlB.gType = gType;
    
    $timeout(() => {
      if(growlB.gType != 'danger') 
        growlB.msg = '';
    }, 8000)
    
    growlB.extra = {};

  }


  return growlB
}


angular.module('247App')
  .factory('growlB', growlbService);
