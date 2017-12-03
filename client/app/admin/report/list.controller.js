'use strict';

(function () {

  class ReportListController {
    constructor($http, $state) {
      this.ipSummary = [];
      this.stateParam = $state;
      this.http = $http;
      this.state = 'show-ip';
      var self = this;

      $http.get('/api/ip/summary')
        .success(function (data) {
          data.forEach((d) => {
            d.value = (d.count / 5) * 100;
            if (d.value < 25) {
              d.type = 'success';
            } else if (d.value < 50) {
              d.type = 'info';
            } else if (d.value < 75) {
              d.type = 'warning';
            } else {
              d.type = 'danger';
            }
          });
          self.ipSummary = data;
        });
    }

    deleteChat(reports, index) {
      var self = this;
      this.http.post('/api/chat/delete', _.pick(reports, '_id'))
        .success(function(data) {
          self.reports.splice(index, 1);
        });
    }
    
    showReport(ip) {
      this.selected=ip;
      var self = this;
      this.http.post('/api/ip/incidents', {
        ip: ip.ip
      }).then(function (res) {
        self.reports = res.data;
        self.state = 'show-report';
      });
    }

    banIp(ip) {
      var self = this;
      this.http.post('/api/ip/ban', this.selected).then(function (res) {
        self.selected.banned=true;
      });
    }


    showSingleChat(report) {
        this.incidentChat = JSON.parse(report.chat);
        this.showincidentChatModal = true;
    }

    banUser(incidentId) {
      var data = {
        id: incidentId
      };
      var self = this;
      //get data first than showchat true
      this.http.post('/api/user/ban', data).then(function (res) {
        //self.stateParam.go('admin.dashboard');
        window.location.reload();
      });
    }

    unbanUser(incidentId) {
      var data = {
        id: incidentId
      };
      var self = this;
      //get data first than showchat true
      this.http.post('/api/user/unban', data).then(function (res) {
        window.location.reload();
      });
    }
  }

  angular.module('247App')
    .controller('ReportListController', ReportListController);
})();
