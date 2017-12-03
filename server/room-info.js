'use strict';

import shortid from 'shortid';
import encryption from './encryption';


// import mongoose from 'mongoose';
// var RoomModel = mongoose.model('Room', {
//     started: Date
// });




var algorithm = 'aes-256-ctr',
    password = 'dafaqq';


var RoomInfo = {};

RoomInfo.create = (pair, notifications) => {
    var roomId = shortid.generate();
    
    pair.venter.roomId = roomId;
    pair.listener.roomId = roomId;

    pair.venter.partnerIp=pair.listener.ip;
    pair.listener.partnerIp=pair.venter.ip;

    pair.venter.emit('room-info', {connectionType:'new',roomId:encryption.encrypt('venter:' + roomId + ":"+ pair.venter.ip)});
    pair.listener.emit('room-info', {connectionType:'new',roomId:encryption.encrypt('listener:' + roomId + ":"+ pair.listener.ip)});
    pair.venter.join(roomId);
    pair.listener.join(roomId);
    var tokens=[];
    if (pair.venter.deviceToken)
        tokens.push(pair.venter.deviceToken)
    if (pair.listener.deviceToken)
        tokens.push(pair.listener.deviceToken)

    notifications.expoNotify('Your Buddy is here', tokens)
};

RoomInfo.getPariInfo = (info, socket) => {
    var roomInfo = encryption.decrypt(info).split(':');
    socket.partnerIp=roomInfo[2];
    return {
        connectionType:'reconnect',
        role:roomInfo[0],
        roomId:roomInfo[1]
    };
};

export default RoomInfo;
