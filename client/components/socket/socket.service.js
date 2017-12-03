/* global io */
'use strict';

angular.module('247App')
  .factory('socket', function(socketFactory,$rootScope) {

    var ioSocket = io('', {
      // 'query': 'token=' + Auth.getToken()
      path: '/socket.io-client',
      reconnection: true
    });

    var socket = socketFactory({
      ioSocket
    });

     $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
        ioSocket.emit('cleanup')

    });

    return socket;
  });
