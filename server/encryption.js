'use strict';

import crypto from 'crypto';
import shortid from 'shortid';

var algorithm = 'aes-256-ctr',
    password = process.env.ENCRYPTION_PASSWORD;

var enc = {};
enc.encrypt = function(text) {
    var cipher = crypto.createCipher(algorithm, password);
    var crypted = cipher.update(text, 'utf8', 'hex');
    crypted += cipher.final('hex');
    return crypted;
}

enc.decrypt = function(text) {
    var decipher = crypto.createDecipher(algorithm, password);
    var dec = decipher.update(text, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
}

export default enc;
