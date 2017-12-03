'use strict';

(function() {

    class SponsorCreateController {
        constructor($http, growl, $state,Upload) {
            this.sponsor = {};
            this.http = $http;
            this.state = $state;
            this.growl = growl;
            this.Upload = Upload;
            var sponsorData = this;
        }

        createsponsor() {
            // send login data
            if (this.sponsor.picFile) {
                this.upload(this.sponsor.picFile,this.growl);
            }
            this.sponsor = {};
        
        }

        // upload on file select or drop
        upload(file,growl) {
            var self=this;
            this.Upload.upload({
                url: '/api/sponsor/create',
                data: { file: file, 'data': this.sponsor}
            }).then(function(resp) {
                self.state.go('admin.sponsor.list');
                growl.info('Sponsor Created Successfully.');
            }, function(resp) {
                console.error('Error status: ' + resp.status);
                growl.warning(resp.status);
            }, function(evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            });
        }
    }

    angular.module('247App')
        .controller('SponsorCreateController', SponsorCreateController);
})();
