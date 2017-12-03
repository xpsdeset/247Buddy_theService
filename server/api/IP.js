import mongoose from 'mongoose';
import encryption from '../encryption';
import _ from 'lodash';

var IP = {};



IP.reportIncidentModel = mongoose.model('reportIncidentModel',
  mongoose.Schema({
    ip: String,
    reason: String,
    time: Date,
    reportIp: String,
    role: String,
    chat: String
  }));

IP.permanentIpBanned = mongoose.model('permanentIpBanned',
  mongoose.Schema({
    ip: String
  }));


IP.reportIncident=(obj,callback)=>{
    var bannedObject = {
            ip: obj.ip,
            time:(new Date()).toJSON(),
            role: obj.role,
            reportIp:encryption.encrypt(obj.reportIp),
            reason: encryption.encrypt(obj.reason),
            chat: encryption.encrypt(JSON.stringify(obj.messages))
        };

    (new IP.reportIncidentModel(bannedObject)).save(()=> callback() )
}  

IP.checkBannedIp=(ip,callback)=>{

        IP.permanentIpBanned.find({ }, '-_id ip').exec(function(err, ips) {
          ips=_.map(ips,'ip');
          if(_.includes(ips, ip))
            return callback()

            IP.reportIncidentModel
            .find({ ip: ip })
            .distinct('reportIp')
            .exec(function (err, rec) {
            if(rec.length>=3)
                callback()
            });

        })

    
}

IP.route = (app) => {

  app.get('/api/ip/summary', function (req, res) {
    IP.reportIncidentModel.aggregate([{
        $group: {
          _id: "$ip",
          reportIps: { $addToSet:"$reportIp"}
        }
      }])
      .sort({
        count: -1
      })
      .exec(function (err, data) {
        IP.permanentIpBanned.find({ }, '-_id ip').exec(function(err, ips) {
          ips=_.map(ips,'ip')
          data.forEach(d=>{
            d.count=d.reportIps.length
            d.ip=d._id;
            d.banned=_.includes(ips, d.ip);
          })
        
          res.json(data);
        });

      });
  });

  app.post('/api/chat/delete', function(req, res) {
    IP.reportIncidentModel.remove({ _id: req.body._id }, function(err, data) {
      if (err) 
        return res.json(err);
      res.json({ status: "ok" }); 
    });
  });

  app.post('/api/ip/ban', function (req, res) {
    (new IP.permanentIpBanned({ ip: req.body.ip }))
      .save()
      .then(function () {
        res.json({status:'ok'});
      });
  });

 app.post('/api/ip/incidents', function (req, res) {
    IP.reportIncidentModel.find({ ip: req.body.ip })
      .sort({
        time: -1
      })
      .exec(function (err, data) {
          data.forEach(function(d) {
            d.reportIp=encryption.decrypt(d.reportIp);
            d.reason= encryption.decrypt(d.reason);
            d.chat= encryption.decrypt(d.chat)
          });
        res.json(data);
      });
  });

}


export default IP;
