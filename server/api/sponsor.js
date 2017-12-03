import mongoose from 'mongoose';
import encryption from '../encryption';
import fs from 'fs.extra';
import shortid from 'shortid';
import _ from 'lodash';
import config from '../config/environment';
//create schema
var sponsorSchema = mongoose.Schema({
  name: String,
  website: String,
  image_url: String,
  image_path: String,
  amount: String,
  time: Date
});

var sponsor = {};
var sponsorModel = mongoose.model('sponsorModel', sponsorSchema);
var sponsorUser = {};
sponsorUser.sponsorModel = sponsorModel;

sponsorUser.route = function(app) {
  app.get('/api/sponsor/list', function(req, res) {
    var select='image_url';
    if (req.query.all)
      select='image_url name amount';
    sponsorModel.find({}, select , { sort: { 'time': -1 } }, function(err, data) {
      if (err) {
        console.error("Error Fetching Data");
      } else {
        res.json(data);
      }
    });


  });

  var multiparty = require('connect-multiparty'),
    multipartyMiddleware = multiparty();


  app.post('/api/sponsor/delete', function(req, res) {
    sponsorModel.find({ _id: req.body._id }, function(err, data) {
      if (err) 
        return res.json(err);
        
        fs.unlink(data[0].image_path, function(errData) {
          if (errData)
            return res.json(errData);

            data.remove(function(errRemove) {
              res.json({ status: "ok" });
            });
        });
      
        
    });
  });




  app.post('/api/sponsor/create', multipartyMiddleware, function(req, res) {

    sponsor = _.pick(req.body.data, 'name', 'website', 'amount');
    sponsor.time = new Date();
    var contentType = req.files.data.picFile.type;

    if (contentType == "image/png" || contentType == "image/jpeg" || contentType == "image/gif") {
      var fileExtension = '.' + req.files.file.name.split('.').pop();
      var tmp_path = req.files.file.path;
      var image_name = 'sponsers_' + shortid.generate() + fileExtension;
      sponsor.image_url = config.uploads.url+image_name;
      sponsor.image_path = config.uploads.path+image_name;

      fs.move(tmp_path, sponsor.image_path, function(err) {
        if (err)
          throw err
        var newSponsor = new sponsorModel(sponsor);
        newSponsor.save(function(err) {
          if (err)
            throw err
          res.json({ status: "ok" })
        });
      });
    }
    else
      res.status(500)({ msg: "bad file" })


  });


  
}

export default sponsorUser;
