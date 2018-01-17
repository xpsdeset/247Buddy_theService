import cron from 'node-cron';
import notifications from './notifications';
import deviceTokens from './deviceTokens';


var cronObj={}

cronObj.bootcron = function (ventingUsers) {

    
    cron.schedule('*/30 * * * * *', async function () {
        var listenerTokens = await deviceTokens.getListenerTokens()
        var waitingUsers = await deviceTokens.getVenterWaitingTokens()
        
        var alreadyGotNotificationTokens = await deviceTokens.getListenerNotificationTokens()
        var waitingUsersCount=0;
        var webventingUsers=ventingUsers();

        
        if(webventingUsers)
            waitingUsersCount = webventingUsers.length
        
        waitingUsersCount = waitingUsers.length + waitingUsersCount;

        if (!waitingUsersCount)
        return
        
        

        let tokensMsg = [];

        
        if (!waitingUsersCount)
            return

        var msg = `There are ${waitingUsersCount} venter(s) on hold`;
        var dataMsg = `${msg} \n Do you want to talk to them?`;

        listenerTokens.forEach(d=>{
            if (waitingUsers.includes(d) || alreadyGotNotificationTokens.includes(d))
                return 
            
            var obj={token:d};
            obj.body = msg
            obj.data = {
                msg: dataMsg,
                state:'need-pairing-venter'
            }
            tokensMsg.push(obj)
        });

        // console.log(
        //     listenerTokens,
        //     waitingUsers,
        //     tokensMsg
        // )
        
        // console.log(tokensMsg)
        notifications.expoNotify(tokensMsg)
    });

}


export default cronObj;