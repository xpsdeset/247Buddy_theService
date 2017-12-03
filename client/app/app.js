'use strict';

angular.module('247App', ['247App.auth', '247App.constants', 'ngCookies',
        'ngResource', 'ngSanitize', 'btford.socket-io', 'ui.router', 'ui.bootstrap',
        'validation.match', 'ngAnimate',
        'yaru22.angular-timeago',
        'angular-web-notification',
        'angular-growl',
        'vcRecaptcha', 'ngFileUpload'
    ])
    .config(function($urlRouterProvider, $locationProvider, growlProvider, $stateProvider, vcRecaptchaServiceProvider,timeAgoSettings) {

        timeAgoSettings.strings.en_US.seconds='a moment';
        vcRecaptchaServiceProvider.setSiteKey('6Le4kg0UAAAAAGnZfSUjuYQZaly_Y3lYtk_-Xhcu');
        $urlRouterProvider.otherwise('/404');
        $locationProvider.html5Mode(true);
        // growlProvider.globalDisableCloseButton(true);
        // growlProvider.globalDisableCountDown(true);
        // growlProvider.globalPosition('top-left');
        // growlProvider.globalTimeToLive(5000);
    })


angular.module('247App')
.run(function($rootScope) {
    $rootScope.$on('$stateChangeStart', function(e, toState, toParams, fromState, fromParams) {
        $rootScope.currentState=toState.name;
          window.scrollTo(0, 0);

    });
});