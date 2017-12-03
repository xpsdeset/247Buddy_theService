'use strict';

(function() {

    class BadgeListController {
        constructor($http,  $state) {
            this.bannedUsers = [];
            this.stateParam = $state;
            this.http = $http;
            this.state = 'show-ip';
            this.reportDataMsg = 'No request Reports';
            //self.currentState = 'i.fa.fa-times';
            var self = this;
            $http.get('/api/badge/list')
                .success(function(data) {
                    self.badgeList = data;
                })
        }
    }

    angular.module('247App')
        .controller('BadgeListController', BadgeListController);
})();
