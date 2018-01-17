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

let listenerNotificationTokenSchema = mongoose.Schema({
  token: { type: String, unique: true },
}, { timestamps: true });
listenerNotificationTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 });

var listenerNotificationTokenModel = mongoose.model('listenerNotificationTokenModel', listenerNotificationTokenSchema);

token.saveListenerNotificationTokens = (tokens) => {
  tokens=tokens.map(d =>{ 
   return { token: encryption.encrypt(d) }
  })

  listenerNotificationTokenModel.create(tokens).then(
    (err,d)=>{
      // console.log(err, d)
    }
  )
}

token.getListenerNotificationTokens = async (socket) => {
  try {
    var tokens = await listenerNotificationTokenModel.find({}, 'token')
    return tokens.map(d => d.token)

  } catch (error) {
    return []
  }
}



token.addVenterToken= (socket) =>{
  var obj = { id: encryption.encrypt(socket.ip), token: socket.deviceToken };
  (new venterTokenModel(obj)).save()

}

token.getVenterWaitingTokens = async (socket) => {
  try {
    var tokens = await venterTokenModel.find({}, 'token')
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
