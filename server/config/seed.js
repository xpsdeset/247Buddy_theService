/**
 * Populate DB with sample data on server start
 * to disable, edit config/environment/index.js, and set `seedDB: false`
 */

'use strict';
import User from '../api/user/user.model';
import shortid from 'shortid';



User.find({
    email: '247buddyadmin'
  })
  .exec(function (err, docs) {
    var password= shortid.generate()+shortid.generate();
    if (!docs.length) {
      User.create({
          provider: 'local',
          role: 'admin',
          name: 'Admin',
          email: '247buddyadmin',
          password: password
        })
        .then(() => {
          var fs = require('fs');
          fs.writeFile("auth.txt", password); 
        });

    }
  });
