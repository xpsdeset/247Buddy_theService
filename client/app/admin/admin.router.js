'use strict';

angular.module('247App')
  .config(function($stateProvider) {
    $stateProvider
      .state('admin', {
        url: '/admin',
        templateUrl: 'app/admin/admin.html',
        authenticate: true,
        access: 'admin'
      })
      .state('admin.sponsor', {
        url: '/sponsor',
        abstract: true,
        template: '<ui-view></ui-view>'
      })
      .state('admin.sponsor.list', {
        url: '',
        templateUrl: 'app/admin/sponsor/list.html',
        controller: 'SponsorListController',
        authenticate: true,
        controllerAs: 'sponsor_list_ctrl',
        access: 'admin'
      })
      .state('admin.sponsor.create', {
        url: '/create',
        templateUrl: 'app/admin/sponsor/create.html',
        controller: 'SponsorCreateController',
        controllerAs: 'sponsor_create_ctrl',
        authenticate: true,
        access: 'admin'
      })

      .state('admin.loading', {
        url: '/loading',
        abstract: true,
        template: '<ui-view></ui-view>'
      })
      .state('admin.loading.list', {
        url: '',
        templateUrl: 'app/admin/loading/list.html',
        controller: 'LoadingListController',
        authenticate: true,
        controllerAs: 'loading_list_ctrl',
        access: 'admin'
      })
      .state('admin.loading.create', {
        url: '/create',
        templateUrl: 'app/admin/loading/create.html',
        controller: 'LoadingCreateController',
        controllerAs: 'loading_create_ctrl',
        authenticate: true,
        access: 'admin'
      })

      .state('admin.report', {
        url: '/report',
        abstract: true,
        template: '<ui-view></ui-view>'
      })
      .state('admin.report.list', {
        url: '',
        templateUrl: 'app/admin/report/list.html',
        controller: 'ReportListController',
        authenticate: true,
        controllerAs: 'report_list_ctrl',
        access: 'admin'
      })
      .state('admin.report.ip', {
        url: '',
        templateUrl: 'app/admin/report/ip.html',
        controller: 'ReportListController',
        authenticate: true,
        controllerAs: 'report_list_ctrl',
        access: 'admin'
      })


      .state('admin.badge', {
        url: '/badge',
        abstract: true,
        template: '<ui-view></ui-view>'
      })
      .state('admin.badge.list', {
        url: '',
        templateUrl: 'app/admin/badge/list.html',
        controller: 'BadgeListController',
        authenticate: true,
        controllerAs: 'badge_list_ctrl',
        access: 'admin'
      });


  });
