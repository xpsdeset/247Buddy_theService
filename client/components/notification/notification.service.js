'use strict';

function notificationService(webNotification) {
    // AngularJS will instantiate a singleton by calling "new" on this function
    var notification = {

    };

    notification.playHello = () => {
        var sound = new Audio('/assets/audio/hello.mp3');
        sound.play();
    }

    notification.playPop = () => {
        var sound = new Audio('/assets/audio/pop.mp3');
        if (document.hidden)
            sound.play();
    }

    notification.message = function(msg) {
        if (document.hidden) {
            //play Title
            notification.playPop();
            //show notification
            webNotification.showNotification('247Buddy', {
                body: msg.text,
                icon: "/assets/images/logo.png", 
                autoClose: 4000 //auto close the notification after 4 seconds (you can manually close it via hide function)
            });

            //change Title
            var isOldTitle = true;
            var oldTitle = "247Buddy";
            var newTitle = 'New message - 247Buddy';
            var interval = null;

            function changeTitle() {
                document.title = isOldTitle ? oldTitle : newTitle;
                isOldTitle = !isOldTitle;
                if (!document.hidden) {
                    clearInterval(interval);
                    document.title = "247Buddy";
                }
            }
            interval = setInterval(changeTitle, 700);
        }
    }
    return notification;
}

angular.module('247App')
    .service('notification', notificationService);
