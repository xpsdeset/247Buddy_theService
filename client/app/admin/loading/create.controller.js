'use strict';

(function() {

    class LoadingCreateController {
        constructor($http, growl, $state,Upload) {
            this.loading = {};
            this.http = $http;
            this.state = $state;
            this.growl = growl;
            this.Upload = Upload;
            var loadingData = this;
        }

        createloading() {
            // send login data
            if (this.loading.picFile) {
                this.upload(this.loading.picFile,this.growl);
            }
            this.loading = {};

        }

        // upload on file select or drop
        upload(file,growl) {
            var self=this;
            this.Upload.upload({
                url: '/api/loading/create',
                data: { file: file, 'data': this.loading}
            }).then(function(resp) {
                self.state.go('admin.loading.list');
                growl.info('loading Created Successfully.');
            }, function(resp) {
                console.error('Error status: ' + resp.status);
                growl.warning(resp.status);
            }, function(evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
            });
        }
    }

    angular.module('247App')
        .controller('LoadingCreateController', LoadingCreateController);
})();
