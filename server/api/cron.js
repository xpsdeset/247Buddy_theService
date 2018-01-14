import cron from 'node-cron';
import notifications from './notifications';
import deviceTokens from './deviceTokens';


var cronObj={}

cronObj.bootcron= function() {

    cron.schedule('*/30 * * * * *', async function () {
        var tokens = await deviceTokens.getListenerTokens()
        var waitingUsers = await deviceTokens.getVenterWaitingTokens()
        if (!waitingUsers.length)
            return
        console.log("---------------------------")
        console.log(tokens, waitingUsers)
        var msg= `There are ${waitingUsers.length} venter(s) on hold`;
        notifications.expoNotify(msg, tokens)
    });

}


export default cronObj;