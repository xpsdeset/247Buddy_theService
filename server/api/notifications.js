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




notifications.notifyDiscord = (msg) => {
    discord.Bot.sendMessage({
            to: discord.channel,
            message: `${msg}
                Please help them at https://247buddy.net/chat
            `
        });
}
notifications.notifyExpo = (tokensMsg) => {

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
                console.error('error');
                console.error(error);
            }
        }
    })();
}

export default notifications;