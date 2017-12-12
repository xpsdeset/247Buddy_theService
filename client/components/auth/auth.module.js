'use strict';

angular.module('247App.auth', ['247App.constants', '247App.util', 'ngCookies', 'ui.router'])
  .config(function($httpProvider) {
    $httpProvider.interceptors.push('authInterceptor');
  });
