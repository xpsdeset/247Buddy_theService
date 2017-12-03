/**
 * Socket.io configuration
 */
'use strict';

import config from './config/environment';
import RoomInfo from './room-info';
import payment from './api/payment';
import _ from 'lodash';
import IP from './api/IP';
import notifications from './api/notifications';
import encryption from './encryption';
import deviceTokens from './api/deviceTokens';



export default function (socketio) {
  

  
  socketio.on('connection', function (socket) {

    var allSockets=()=>_.values(socketio.sockets.sockets);
    var partnerKey = {
      venter: 'listener',
      listener: 'venter'
    };
    socket.partner = () => {
      var partner = false;
      
      if(socket.roomId && socket.roomId!='listener' && socket.roomId!='venter')
        partner = allSockets().find(s => s.roomId == socket.roomId && s.role==partnerKey[socket.role]);
      
      return partner || {emit:function(){},notAvilable:true}
    }

    socket.on('find-pair', role => {
      socket.role = role;
      socket.roomId=role;

      if (socket.roomId=='listener' || socket.roomId=='venter') {
        var pair={};
        pair[role] = socket;
        var partnerRole=partnerKey[role];
        pair[partnerRole]=allSockets().find(s => s.roomId == partnerRole);
        if(pair[partnerRole])
            {
              RoomInfo.create(pair, notifications);
              notifications.clearIdle(pair.venter);
            }
        else if (socket.roomId == 'venter')
            notifications.notifyOnIdle(socket)
          
      } 
      globalInfo();

    });

    socket.on('reconnect-to-room', eInfo => {

      try {
        var roomInfo = RoomInfo.getPariInfo(eInfo,socket);
        
      socket.roomId = roomInfo.roomId;
      socket.role = roomInfo.role;
      socket.join(socket.roomId);
      socket.isPaired = true;
      var partner=socket.partner();
      if(!partner.notAvilable)
      {
        partner.emit('room-info', roomInfo);
      }
      else
        roomInfo.notAvilable=partner.notAvilable;
      
      socket.emit('room-info', roomInfo);
      } catch (error) {
        socket.emit('404')
      }

    });

    socket.on('report-partner-disconnect', () => {
      socket.partner().emit('partner-disconnected', {reason: 'bad_internet'});
    });

 

    socket.on('set-ip', (deviceId) => {
      var ip;
      if (deviceId)
        ip = deviceId;
      else if ( _.isEmpty(socket.request.headers['x-forwarded-for']) || socket.request.headers['x-forwarded-for'] == "10.0.2.2")
        ip = _.sample([
          '10.0.0.2',
          '10.255.255.255',
          '172.16.0.0',
          '172.16.1.0',
          '172.16.2.0',
          '192.168.0.1',
          '192.168.0.2',
          '192.168.0.3',
          '192.168.255.255'
        ])
      else
        ip = socket.request.headers['x-forwarded-for'];
      
      socket.ip = ip;
      
      IP.checkBannedIp(socket.ip,()=> socket.emit('bannedUser'))
      
      globalInfo(true);
    });

    socket.on('set-device-token', (token) => {
      socket.deviceToken = encryption.encrypt(token);
    })

    socket.on('register-listener', flag=>{
      deviceTokens.addRemoveToken(socket,flag)
    })


    socket.on('request-clear-messages', () => {
      socketio.to(socket.roomId).emit('clear-messages');
    });

    // Call onDisconnect.

    var cleanUp=() => {

      if(socket.roomId)
      {
        socket.partner().emit('partner-disconnected', {
          reason: 'bad_internet'
        });

        if(socket.roomId == 'venter')
          notifications.clearIdle(socket)

        socket.roomId=false;
        socket.leave(socket.roomId);
        globalInfo();
      }

    }
    socket.on('disconnect', cleanUp);
    socket.on('cleanup', cleanUp);


    function globalInfo(flag) {
      var sock = socketio.sockets;
      // if (flag)
      //   sock = socket;
      var allSocks=allSockets();
      var listenerCount=0;
      var venterCount=0;
      var rooms=[];
      allSocks.forEach(d=>{
        if(d.roomId){
          if(d.roomId=='listener')
            listenerCount+=1;
          else if(d.roomId=='venter')
              venterCount+=1;
          else
            rooms.push(d.roomId);
        }
      })

      sock.emit('global-info', {
        conversationCount: _.uniq(rooms).length,
        listenerCount: listenerCount,
        venterCount: venterCount
      });
    }

    




    socket.on('is-typing', (isTyping) => {
      socketio.to(socket.roomId).emit('partner-typing', {
        role: socket.role,
        isTyping: isTyping
      })
    });

    socket.on('message-to-room', (message) => {
      socketio.to(socket.roomId).emit('message-from-room', {
        name: socket.role,
        role: socket.role,
        time: (new Date()).toJSON(),
        text: message
      });
    });

    socket.on('report-incident', (messages, reason) => {

      var bannedObject = {
        ip: socket.partnerIp,
        reason: reason,
        reportIp: socket.ip,
        role: socket.role,
        messages: messages
      };
      IP.reportIncident(bannedObject,()=>socket.emit('incident-recorded'))

    });

  

    socket.on('create-badge', (badge) => {
      badge.time= new Date();
      badge.roomId= socket.roomId;
      payment.initPayPal(badge,url=>socket.emit('paymentUrl', url))
    });

    socket.on('badge-purchased', () => {
      socket.partner().emit('badge-purchased');
    });




  });
}
