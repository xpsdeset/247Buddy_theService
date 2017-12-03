'use strict';

(function () {

  class TalkComponent {


    constructor(socket, $http, $stateParams, $scope, $timeout, notification, $state, growlB, $cookies, $window, $interval) {
      this.status = 'not-paired';
      this.growlB = growlB;
      this.reported = false;
      this.messages = [];
      this.reason = '';
      var self = this;
      this.partnerKey = {
        venter: 'listener',
        listener: 'venter'
      };

      this.globalInfo = {
      };

      this.socket = socket;
      this.cookies = $cookies;

      this.messageToSend = '';
      this.reportMessage = '';
      this.showReport = false;
      this.showBadges = false;
      this.captchaErr = false;
      this.tosAgreed = $cookies.get('aggrement');
      this.badgeType = '';
      this.badgeMessage = '';
      this.loadingCarousel = 0;
      var self=this;
      $http.get('/api/loading/list')
        .success(function (data) {
          self.loadingImages = data;
        });
      this.paymentUrl = '';


      socket.emit('set-ip');

      this.roomId = $stateParams.roomId;
      if (this.roomId) {
        socket.emit('reconnect-to-room', this.roomId);
      }

       socket.on('reconnect', function() {
            if ($stateParams.roomId) 
              socket.emit('reconnect-to-room', $stateParams.roomId);

            if (self.status == 'finding-pair') 
              socket.emit('find-pair', self.role)
              
        });

      socket.on('message-from-room', message => {
        var chatBox = $('.chat-history ul');
        message.hidden = false;
        message.time=new Date(message.time);
        this.messages.push(message);
        if (message.role != this.role) {
          this.lastMessage = message;
          notification.message(message);
        }
          $timeout(() => chatBox.scrollTop(chatBox[0].scrollHeight), 100);
      });

      socket.on('clear-messages', () => {
        this.messages.forEach(msg => msg.hidden = true);
        var infoMsg=`Your buddy has cleared the chat.`;
        if(this.role!='venter')
        infoMsg=`This chat has been cleared.`;
        growlB.notify('info',infoMsg);
      });

      socket.on('disconnect', err => {
        console.log(err);
        growlB.notify('danger','You are not connected to the internet or our servers.');
        this.disconnected = true;
        this.growlB.extra ={self_disconnect:true} ;
      });
      
      socket.on('partner-disconnected', info => {
        this.disconnected = true;
        growlB.notify('danger','You partner has disconnected');
        this.growlB.extra ={new_chat:true} ;
      });

      socket.on('incident-recorded', info => {
        this.growlB.notify('danger','Report incident recorded.');
        this.growlB.extra={new_chat:true,report:true};
      });


      socket.on('partner-typing', info => {
        if (this.role != info.role)
          this.partnerTyping = info.isTyping;
      });


      socket.on('room-info', info => {

        
        this.disconnected = false;
        if (!this.timeSinceChat)
        this.timeSinceChat = new Date();
        if (info.connectionType != 'reconnect') {
          if (document.hidden)
          alert('Sorry to disturb you but your buddy is here');
          this.roomId=info.roomId;
          $state.go('chat', {
            roomId: info.roomId
          }, {
            notify: false
          });
          this.status = 'paired';
          notification.playHello();
          growlB.notify('info',`Hey there,your buddy is here.`);
          growlB.extra.hello=true;
        } else {
          if (!this.role)
            this.role = info.role;
          this.reconnect = true;
          if (info.notAvilable) {
            if(_.isEmpty(this.messages))
              this.status = 'finding-pair';
            
          } else {
            this.status = 'paired';
            growlB.notify('info',`Hey your buddy is back.`);

          }

        }


      });

      socket.on('bannedUser', data => {
        $state.go('401')
      });

      socket.on('404', data => {
        $state.go('404')
      });

      socket.on('paymentUrl', paymentUrl => {
        this.paymentWindoOpen=true;
        $window.open(paymentUrl, 'paypal', 'width=600, height=600');
      });


      $window.postPayment = (status,msg) => {
        $timeout(()=>{
            if (status) {
              growlB.notify('success','Thank you so much for contributing towards 247Buddy. Hope this conversation made your day');
              this.socket.emit('success-create-badge');
            } else {
              growlB.notify('warning','Your badge could not be purchased. Aww you tried but do try again later.');
              if(msg!='undefined')
              growlB.extra={err_msg:msg}
            }
        })
      };


      socket.on('badge-purchased', () => {
        growlB.notify('success','Thanks to you, your buddy has purchased a badge. Pat yourself on the back.');
      });

      socket.on('global-info', globalInfo => {
        this.globalInfo = globalInfo;
        // if (this.globalInfo.listenerCount == 0 && this.globalInfo.venterCount == 0) {
        //   this.globalInfo.listenerPercentage = 50;
        //   this.globalInfo.venterPercentage = 50;
        // } else {
        //   var total = this.globalInfo.listenerCount + this.globalInfo.venterCount;
        //   this.globalInfo.listenerPercentage = (this.globalInfo.listenerCount / total) * 100;
        //   this.globalInfo.venterPercentage = (this.globalInfo.venterCount / total) * 100;

        // }
        this.waitCount=this.globalInfo.listenerCount - this.globalInfo.venterCount;
      });

      $scope.$watch(() => this.isTyping, (newValue) => {
        socket.emit('is-typing', this.isTyping);
      });

      Date.prototype.formatAMPM = function () {
        var hours = this.getHours();
        var minutes = this.getMinutes();
        var ampm = hours >= 12 ? 'pm' : 'am';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        minutes = minutes < 10 ? '0' + minutes : minutes;
        var strTime = hours + ':' + minutes + ' ' + ampm;
        return strTime;
      }

    }

    sendMessage() {
      if(!_.isEmpty(this.messageToSend))
        this.socket.emit('message-to-room', this.messageToSend);
      this.messageToSend = '';
    }

    reportUser() {
      this.showReport = true;
    }

    showBadge() {
      this.showBadges = true;
      this.badgeType = 'silver';
      this.badgeMessage = '';
    }

    createBadge() {

      var badgeAmount={
        silver:2,
        gold:5,
        bronze:1
      };

      var badge={
        type:this.badgeType,
        comment:this.badgeMessage,
        amount:badgeAmount[this.badgeType]
      };

      this.socket.emit('create-badge', badge);
    }

    setAgree() {

      //user has accepted the aggrement

      if (!this.notARobot) {
        this.tosAgreed = false;
        this.captchaErr = true;
      } else {
        this.tosAgreed = true;
        //set cokkie
        var now = new Date();
        var time = now.getTime();
        time += 24 * 60 * 60 * 1000;
        now.setTime(time);
        this.cookies.put('aggrement', 'agree', {
          expires: now
        });
      }

    }
    sendReport() {
      this.socket.emit('report-incident', angular.copy(this.messages), this.reason);
      // this.socket.emit('disconnect');
      // this.socket.emit('report-partner-disconnect');
    }


    findPair(role) {
      this.status = 'finding-pair';
      this.socket.emit('find-pair', role);
      this.role = role;
      this.partnerRole = this.partnerKey[role];
    }

    youAre(role) {
      return this.role == role ? '(You)' : '';
    }
    messageClass(message) {
      if (message.role == 'listener')
        return 'listner_msg';
      if (message.role == 'venter')
        return 'ventor_msg';
    }
    messageIcon(message) {
      var userRole = this.youAre(message.role);
      if (userRole == '') {
        return 'sender-icon';
      } else {
        return '';
      }

    }
    messageContentBlock(message) {
      var userRole = this.youAre(message.role);
      if (userRole == '') {
        return 'sender-content-block';
      } else {
        return 'receiver-content-block';
      }
    }
    messageContent(message) {
      var userRole = this.youAre(message.role);
      if (userRole == '') {

        return 'sender-content';
      } else {
        return 'receiver-content';
      }
    }
    messageChatWrapper(message) {
      var userRole = this.youAre(message.role);
      if (userRole == '') {

        return 'sender-chat-wrapper';
      } else {
        return 'receiver-chat-wrapper';
      }
    }
    clearMessages() {
      this.socket.emit('request-clear-messages');
    }




  }

  angular.module('247App')
    .component('talk', {
      templateUrl: 'app/talk/talk.html',
      controller: TalkComponent
    });

})();
