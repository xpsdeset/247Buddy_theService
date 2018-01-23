import cron from 'node-cron';
import notifications from './notifications';
import deviceTokens from './deviceTokens';


var cronObj={}

cronObj.bootcron = function (allSockets) {

    cronObj.ventingUsers = () => allSockets().filter(s=> s.roomId == 'venter')
    var pairedUsers = () => allSockets()
                            .filter(s => s.roomId && s.roomId != 'listener' && s.roomId != 'venter')
                            .map(s => s.deviceToken )
        

    cron.schedule('*/30 * * * * *', async function () {
        
        let tokensMsg = [];
        var alreadyGotNotificationTokens = await deviceTokens.getListenerNotificationTokens()

        var waiting = await cronObj.getVentersInfo();

        if (!waiting.UsersCount)
            return

        var listenerTokens = await deviceTokens.getListenerTokens()
        listenerTokens.forEach(d=>{
            if (waiting.Users.includes(d) || alreadyGotNotificationTokens.includes(d) || pairedUsers().includes(d) )
                return 
            
            var obj={token:d};
            obj.body = waiting.msg
            tokensMsg.push(obj)
        });

        
        // console.log(listenerTokens)
        // console.log(waiting.Users)
        // console.log(tokensMsg)
        
        
        // console.log(tokensMsg)
        notifications.notifyExpo(tokensMsg)
    });

}


cronObj.getVentersInfo= async function() {
    

    var waiting = { msg:false};
    waiting.Users = await deviceTokens.getVenterWaitingTokens()

    waiting.UsersCount = 0;
    var webventingUsers = cronObj.ventingUsers() || [];


    waiting.UsersCount = waiting.Users.length + waiting.UsersCount;

    
    if (waiting.UsersCount)
        waiting.msg = `Someone wants to be heard.`;


    return waiting

    
}


cronObj.notifyVentersListenerReady = function (Users) {
    var msg = 'Someone is here to listen';
    var tokensMsg = Users.map(d => {
        var obj = { token: d };
        obj.body = msg
        return obj
    });
    if (tokensMsg && tokensMsg[0])
        notifications.notifyExpo(tokensMsg)

}



export default cronObj;