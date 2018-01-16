import cron from 'node-cron';
import notifications from './notifications';
import deviceTokens from './deviceTokens';


var cronObj={}

cronObj.bootcron = function (ventingUsers) {

    
    cron.schedule('*/30 * * * * *', async function () {
        var listenerTokens = await deviceTokens.getListenerTokens()
        var waitingUsers = await deviceTokens.getVenterWaitingTokens()
        var webventingUsersLen=0;
        var webventingUsers=ventingUsers();
        if(webventingUsers)
            webventingUsersLen = webventingUsers.length
        if (!waitingUsers.length && webventingUsers)
            return
        let tokensMsg = [];

        listenerTokens.forEach(d=>{
            var waitingUsersCount = waitingUsers.length + webventingUsersLen;
            if(waitingUsers.includes(d))
                waitingUsersCount = waitingUsersCount-1;
            

            if (!waitingUsersCount)
                return 
            
            var obj={token:d};
            obj.body = `There are ${ waitingUsersCount } venter(s) on hold`
            tokensMsg.push(obj)
        });

        // console.log(
        //     listenerTokens,
        //     waitingUsers,
        //     tokensMsg
        // )
        console.log(tokensMsg)
        // notifications.expoNotify(tokensMsg)
    });

}


export default cronObj;