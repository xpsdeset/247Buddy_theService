import mongoose from 'mongoose';
import _ from 'lodash';
import config from '../config/environment';
import encryption from '../encryption';
import mongooseDuplicateError from 'mongoose-duplicate-error';

var token={}


var tokenListenerSchema = mongoose.Schema({
  id: String,
  token: { type: String, unique: true }
});
tokenListenerSchema.plugin(mongooseDuplicateError);



var listenerTokenModel = mongoose.model('listenerTokensModel', tokenListenerSchema);
let venterTokenSchema = mongoose.Schema({
  id: String,
  token: { type: String, unique: true },
}, { timestamps: true });
venterTokenSchema.plugin(mongooseDuplicateError);
venterTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 3*60-15 });


var venterTokenModel = mongoose.model('venterTokenModel', venterTokenSchema);
let listenerNotificationTokenSchema = mongoose.Schema({
  token: { type: String, unique: true },
}, { timestamps: true });
listenerNotificationTokenSchema.plugin(mongooseDuplicateError);
listenerNotificationTokenSchema.index({ createdAt: 1 }, { expireAfterSeconds: 60 });
var listenerNotificationTokenModel = mongoose.model('listenerNotificationTokenModel', listenerNotificationTokenSchema);



token.saveListenerNotificationTokens = (tokens) => {
  tokens=tokens.map(d =>{ 
   return { token: encryption.encrypt(d) }
  })

  listenerNotificationTokenModel.create(tokens,(err,d)=>{})
}

token.getListenerNotificationTokens = async () => {
  try {
    var tokens = await listenerNotificationTokenModel.find({}, 'token')
    return tokens.map(d => d.token)

  } catch (error) {
    return []
  }
}



token.addRemoveVenterToken= (socket,flag) =>{
  var obj = { token: socket.deviceToken };

  if (flag)
    (new venterTokenModel(obj)).save((err, d) => { })
  else
    venterTokenModel.find(obj).remove().exec();

}

token.getVenterWaitingTokens = async () => {
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
  (new listenerTokenModel(obj)).save((err,doc)=>{})
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
