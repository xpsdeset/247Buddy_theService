import mongoose from 'mongoose';
import _ from 'lodash';
import config from '../config/environment';
import encryption from '../encryption';
//create schema
var token={}


var tokenListenerSchema = mongoose.Schema({
  id: String,
  token: { type: String, unique: true }
});

var listenerTokenModel = mongoose.model('listenerTokensModel', tokenListenerSchema);

let venterTokenSchema = mongoose.Schema({
  id: String,
  token: { type: String, unique: true },
}, { timestamps: true });
venterTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3*60 });

var venterTokenModel = mongoose.model('venterTokenModel', venterTokenSchema);


token.addVenterToken= (socket) =>{
  var obj = { id: encryption.encrypt(socket.ip), token: socket.deviceToken };
  (new venterTokenModel(obj)).save()

}

token.getVenterWaitingTokens = async (socket) => {
  try {
    var tokens = await venterTokenModel.find({}, 'token')
    console.log(tokens)
    return tokens.map(d => d.token)
    
  } catch (error) {
      return []  
  }
}


token.addRemoveListenerToken= (socket,flag) =>{

  var obj = { id: encryption.encrypt(socket.ip), token: socket.deviceToken };
  
  if (!socket.deviceToken)
    return

  if(flag)
    (new listenerTokenModel(obj)).save()
  else
    listenerTokenModel.find(obj).remove().exec();

}

token.getListenerTokens= async(socket) =>{
  var tokens = await listenerTokenModel.find({}, 'token')
  var expoToken=[]
  tokens.forEach(d => 
    {
    // if (d.token != socket.deviceToken)
      expoToken.push(d.token)
    })
  return expoToken
}

export default token;
