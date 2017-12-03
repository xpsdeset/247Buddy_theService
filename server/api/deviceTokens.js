import mongoose from 'mongoose';
import _ from 'lodash';
import config from '../config/environment';
import encryption from '../encryption';
//create schema
var tokenSchema = mongoose.Schema({
  id: String,
  token: String,
});

var tokenModel = mongoose.model('deviceTokensModel', tokenSchema);
var token={}

token.addRemoveToken= (socket,flag) =>{

  var obj = { id: encryption.encrypt(socket.ip), token: socket.deviceToken };
  if (!socket.deviceToken)
    return

  if(flag)
    (new tokenModel(obj)).save()
  else
    tokenModel.remove(obj)

}

token.getTokens= async(socket) =>{
  var tokens = await tokenModel.find({}, 'token')
  var expoToken=[]
  tokens.forEach(d => 
    {
    if (d.token != socket.deviceToken)
      expoToken.push(d.token)
    })
  return expoToken
}

export default token;
