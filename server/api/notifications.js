import Expo from 'expo-server-sdk';
import Discord from 'discord.io';
import deviceTokens from './deviceTokens';
import encryption from '../encryption';

var discord={
    token: process.env.DISCORD_TOKEN,
    channel: process.env.DISCORD_CHANNEL
}

discord.Bot = new Discord.Client({
    token: discord.token,
    autorun: true
});




var notifications={};

notifications.notifyOnIdle= (socket)=>{
    
    if (!socket.connected)
        return notifications.clearIdle(socket)
        
    var oneMinute=60000;
    socket.idleTime=1;
    socket.interValId=setInterval(
        async()=>{
        var msg = `There is a venter waiting since ${socket.idleTime} minute(s).`;
        
        if (!socket.idleTime > 5)
        return notifications.clearIdle(socket)
        
        
        
            
        discord.Bot.sendMessage({
            to: discord.channel,
            message: `${msg}
                Please help them at https://247buddy.net/chat
            `
        });

            

        socket.idleTime += 1;
    },oneMinute)

}

notifications.clearIdle = (socket) => {
    clearInterval(socket.interValId)    
}


notifications.expoNotify = (tokensMsg) => {

    let expo = new Expo();
    let messages= [];
    

    tokensMsg.forEach(d => {
        d.to = encryption.decrypt(d.token) 
        d.ttl= 20;
        if (!Expo.isExpoPushToken(d.to)) {
            console.error(`Push token ${d.to} is not a valid Expo push token`);
        }
        else
            delete d.token
    })


    let chunks = expo.chunkPushNotifications(tokensMsg);
    var sentTokens=[];

    (async () => {
        for (let chunk of chunks) {
            try {
                let receipts = await expo.sendPushNotificationsAsync(chunk);
                receipts.forEach((d,i)=>{
                    if(d.status=='ok')
                    sentTokens.push(tokensMsg[i].to)
                })
                deviceTokens.saveListenerNotificationTokens(sentTokens)
                
            } catch (error) {
                // console.error('error');
                // console.error(error);
            }
        }
    })();
}

export default notifications;