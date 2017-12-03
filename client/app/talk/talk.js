'use strict';

angular.module('247App')
    .config(function($stateProvider) {
        $stateProvider
            .state('chat', {
                url: '/chat/cp-:roomId',
                template: '<talk></talk>'
            })
            .state('home-ip', {
                url: '/chat',
                template: '<talk></talk>'
            });
    });
