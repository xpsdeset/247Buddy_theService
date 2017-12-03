'use strict';

// Development specific configuration
// ==================================
module.exports = {

  // MongoDB connection options
  mongo: {
    uri: 'mongodb://localhost/247-dev'
  },
  paypal: {
    email:'',
    password:'',
    signature: '',
    sandbox:true,
    successUrl:'http://localhost:9000/api/badge/payment?status=true',
    failureUrl:'http://localhost:9000/api/badge/payment?status=false'
  },


  // Seed database on startup
  seedDB: true

};
