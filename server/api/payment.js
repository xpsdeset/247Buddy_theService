import mongoose from 'mongoose';
import encryption from '../encryption';
import Paypal from 'paypal-express-checkout';
import config from '../config/environment';

//Refer https://github.com/totaljs/node-paypal-express-checkout

var payment = {};


var badgeModel = mongoose.model('badgeModel',mongoose.Schema({
    comment: String,
    time: Date,
    amount: Number,
    type: String,
    payment_object: Object,
    invoiceID: String
}));


var paypal = Paypal.init(config.paypal.email, config.paypal.password, config.paypal.signature, config.paypal.successUrl, config.paypal.failureUrl, config.paypal.sandbox);

paypal.solutiontype='Sole';

var invoiceBadges={};

payment.initPayPal= (badge,callBack)=>{
    var invoiceId='247Buddy - '+badge.roomId;
    invoiceBadges[invoiceId]=badge;
    paypal.pay(invoiceId, badge.amount,`247Buddy ${badge.type} badge` , 'USD', false, function(err, url) {
            if (err) 
                console.error("Paypal error:" + err);
            else
                callBack(url);
        });
}

payment.route = function(app) {


    app.get('/api/badge/list', function(req, res) {
        badgeModel.find({},{},{ sort: { 'time' : -1 }}, function(err, data) {
            if (!err) 
                res.json(data);
        });
    });

    var paymentRes= (res,status,msg)=> res.send(`<script>window.opener.postPayment(${status},'${msg}');window.close();</script>`);


    app.get('/api/badge/payment', function(req, res) {

        var status= req.query.status=='true';


        paypal.detail(req.query.token, req.query.PayerID, function(err, data, invoiceId, price) {


            if (err || !data.success) 
                return paymentRes(res,false,data.PAYMENTREQUESTINFO_0_LONGMESSAGE)
            
            
            if (data.success) {
                invoiceBadges[invoiceId].payment_object=data;
                new badgeModel(invoiceBadges[invoiceId]).save(function(err, data) { 
                    paymentRes(res,true)
                    delete invoiceBadges[invoiceId];
                });
            } 


          

        });
    });
}

export default payment;









