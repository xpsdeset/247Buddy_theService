'use strict';

(function() {

  class LoadingListController {
    constructor($http, $state) {
      var self = this;
      this.$http = $http;
      $http.get('/api/loading/list')
        .success(function(data) {
          self.loadingList = data;
        });
    }
    delete(loaders, index) {
      var self = this;
      self.$http.post('/api/loading/delete', _.pick(loaders, '_id'))
        .success(function(data) {
          self.loadingList.splice(index, 1);
        });

    }
  }

  angular.module('247App')
    .controller('LoadingListController', LoadingListController);
})();
