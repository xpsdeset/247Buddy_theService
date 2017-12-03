'use strict';

var path = require('path');
var _ = require('lodash');

function requiredProcessEnv(name) {
  if (!process.env[name]) {
    throw new Error('You must set the ' + name + ' environment variable');
  }
  return process.env[name];
}

var root_path=path.normalize(__dirname + '/../../..');

// All configurations will extend these options
// ============================================
var all = {
  env: process.env.NODE_ENV,

  // Root path of server
  root: root_path,
  
  uploads : {
      path:root_path+"/client/uploads/",
      url:"/uploads/"
  },
  // Server port
  port: process.env.PORT || 9000,

  // Server IP
  ip: process.env.IP || '0.0.0.0',

  // Should we populate the DB with sample data?
  seedDB: false,

  // Secret for session, you will want to change this and make it an environment variable
  secrets: {
    session: '247-secret'
  },


  // MongoDB connection options
  mongo: {
    options: {
      db: {
        safe: true
      }
    }
  }
};

// require('fs.extra').ensureDirSync(all.uploads.path);

// Export the config object based on the NODE_ENV
// ==============================================
module.exports = _.merge(
  all,
  require('./shared'),
  require('./' + process.env.NODE_ENV + '.js') || {});


