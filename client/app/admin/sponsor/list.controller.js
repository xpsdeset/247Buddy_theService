'use strict';

(function () {

  class SponsorListController {
    constructor($http, $state) {
      var self = this;
      this.$http = $http;
      $http.get('/api/sponsor/list?all=true')
        .success(function (data) {
          self.sponsorList = data;
        });
    }
    delete(sponser, index) {
      var self = this;
      this.$http.post('/api/sponsor/delete', _.pick(sponser, '_id'))
        .success(function (data) {
          self.sponsorList.splice(index, 1);
        });

    }

  }

  angular.module('247App')
    .controller('SponsorListController', SponsorListController);
})();
