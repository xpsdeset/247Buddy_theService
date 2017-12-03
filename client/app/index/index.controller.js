'use strict';

(function() {

    class IndexComponent {
        constructor($http, $interval) {
            this.badges = [];
            this.http = $http;
            var self = this;
            self.badgeCarousel = 0;
            self.sponsorCarousel = 0;
            $http.get('/api/badge/list')
                .success(function(data) {
                    self.badges = data;
                    $interval(() => {
                        self.badgeCarousel += 1;
                        if (self.badgeCarousel >= self.badges.length) self.badgeCarousel = 0;
                    }, 5000);
                });
            $http.get('/api/sponsor/list')
                .success(function(data) {
                    self.sponsors = data;
                    $interval(() => {
                        self.sponsorCarousel += 1;
                        if (self.sponsorCarousel >= self.sponsors.length) self.sponsorCarousel = 0;
                    }, 5000);
                });
        }

    }

    angular.module('247App')
        .component('index', {
            templateUrl: 'app/index/index.html',
            controller: IndexComponent
        });

})();
