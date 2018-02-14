'use strict';
class AccountKitController {
   

  constructor($cookies,$http) {
    this.$http = $http;
    this.$http.get('/api/accountkit/api_details')
        .success(function (data) {
            AccountKit.init(
              {
                appId:data.appId,
                state: $cookies.get('XSRF-TOKEN'),
                version:data.version,
                display:"modal",
                debug:true,
                fbAppEventsEnabled:true
              }
            );

        });

    }
    AccountKitStart() {
      var self=this;
      AccountKit.login('PHONE', {}, 
        function (response) {
          if (response.status === "PARTIALLY_AUTHENTICATED") {
            self.$http.post('/api/accountkit/me', {code:response.code})
              .success(function (data) {
                window.postMessage(JSON.stringify(data))
              })
          }
          else if (response.status === "NOT_AUTHENTICATED") {
            // handle authentication failure
          }
          else if (response.status === "BAD_PARAMS") {
            // handle bad parameters
          }
        }
    );
    }

   
  }

  angular.module('247App')
    .controller('AccountKitController', AccountKitController);







      



function awaitPostMessage() {
  var isReactNativePostMessageReady = !!window.originalPostMessage;
  var queue = [];
  var currentPostMessageFn = function store(message) {
    if (queue.length > 100) queue.shift();
    queue.push(message);
  };
  if (!isReactNativePostMessageReady) {
    var originalPostMessage = window.postMessage;
    Object.defineProperty(window, 'postMessage', {
      configurable: true,
      enumerable: true,
      get: function () {
        return currentPostMessageFn;
      },
      set: function (fn) {
        currentPostMessageFn = fn;
        isReactNativePostMessageReady = true;
        setTimeout(sendQueue, 0);
      }
    });
    window.postMessage.toString = function () {
      return String(originalPostMessage);
    };
  }

  function sendQueue() {
    while (queue.length > 0) window.postMessage(queue.shift());
  }
}

awaitPostMessage();       