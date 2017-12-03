'use strict';

angular.module('247App')
  .config(function($stateProvider) {
    $stateProvider
      .state('index', {
        url: '/',
        template: '<index></index>',

      })
      .state('privacy', {
        url: '/privacy-policy',
        templateUrl: 'app/index/privacy-policy.html'        
      })
      .state('tos', {
        url: '/tos',
        templateUrl: 'app/talk/tos.html',        
        controller:function () {
          this.disableIAgree=true
        },
        controllerAs: '$ctrl'
      })
      .state('404', {
        url: '/404',
        templateUrl: 'app/index/404.html'        
      })
      .state('401', {
        url: '/401',
        templateUrl: 'app/index/401.html'        
      })
      .state('faq', {
        url: '/faq',
        templateUrl: 'app/index/faq.html'        
      })
      .state('contact', {
        url: '/contactus',
        templateUrl: 'app/index/contact.html'        
      });

  });
