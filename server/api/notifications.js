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
    
    var oneMinute=60000;
    socket.idleTime=1;
    socket.interValId=setInterval(
        async()=>{
        var msg = `There is a venter waiting since ${socket.idleTime} minute(s).`;
        var tokens = await deviceTokens.getTokens(socket)


        // if (socket.idleTime%3==1)
        //     notifications.expoNotify(msg, tokens )
        
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


notifications.expoNotify = (msg, tokens) => {

    
    tokens = tokens.map(d=>encryption.decrypt(d))
    console.log(tokens);

    let expo = new Expo();
    let messages = [];
    for (let pushToken of tokens) {
        if (!Expo.isExpoPushToken(pushToken)) {
            console.error(`Push token ${pushToken} is not a valid Expo push token`);
            continue;
        }

        messages.push({
            to: pushToken,
            body: msg,
            data: {  }
        })
    }

    let chunks = expo.chunkPushNotifications(messages);

    (async () => {
        for (let chunk of chunks) {
            try {
                let receipts = await expo.sendPushNotificationsAsync(chunk);
                // console.log(receipts);
            } catch (error) {
                console.error(error);
            }
        }
    })();
}

export default notifications;