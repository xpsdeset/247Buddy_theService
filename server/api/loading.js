import mongoose from 'mongoose';
import encryption from '../encryption';
import fs from 'fs.extra';
import shortid from 'shortid';
import _ from 'lodash';
import config from '../config/environment';
//create schema
var loadingSchema = mongoose.Schema({
  name: String,
  caption: String,
  image_url: String,
  image_path: String
});

var loading = {};
var loadingModel = mongoose.model('loadingModel', loadingSchema);
var loadingUser = {};
loadingUser.loadingModel = loadingModel;

loadingUser.route = function(app) {
  app.get('/api/loading/list', function(req, res) {
    loadingModel.find({}).select('image_url').exec(function(err, data) {
      if (err) {
        console.error("Error Fetching Data");
      } else {
        res.json(data);
      }
    });


  });


  app.post('/api/loading/delete', function(req, res) {
    loadingModel.find({ _id: req.body._id }, function(err, data) {
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


  


  var multiparty = require('connect-multiparty'),
    multipartyMiddleware = multiparty();

  app.post('/api/loading/create', multipartyMiddleware, function(req, res) {

    var contentType = req.files.data.picFile.type;

    if (contentType == "image/png" || contentType == "image/jpeg" || contentType == "image/gif") {
      var fileExtension = '.' + req.files.file.name.split('.').pop();
      var tmp_path = req.files.file.path;

      var image_name = 'sponsers_' + shortid.generate() + fileExtension;

      loading = _.pick(req.body.data, 'caption');
      loading.image_url = config.uploads.url+image_name;
      loading.image_path = config.uploads.path+image_name;


      fs.move(tmp_path, loading.image_path, function(err) {
        if (err)
          throw err
        var newLoading = new loadingModel(loading);
        newLoading.save(function(err) {
          if (err)
            throw err
          res.json({ status: "ok" })
        });
      });
    }


  });
}

export default loadingUser;
