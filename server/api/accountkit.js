import Request from 'request';
import Querystring from 'querystring';
import crypto from 'crypto';
import encryption from '../encryption';
import _ from 'lodash';

var AccountKit = {};




AccountKit.route = (app) => {

  app.get('/api/accountkit/api_details', function (req, res) {
      res.json({
          appId: process.env.ACCOUNTKIT_APP_ID,
          version: process.env.ACCOUNT_KIT_API_VERSION
      })
  });

  app.post('/api/accountkit/me', (request, response) => {

      const ACCOUNT_KIT_API_VERSION = process.env.ACCOUNT_KIT_API_VERSION;
      const app_id = process.env.ACCOUNTKIT_APP_ID;
      const app_secret = process.env.ACCOUNTKIT_APP_SECRET;
      const me_endpoint_base_url = `https://graph.accountkit.com/${ACCOUNT_KIT_API_VERSION}/me`;
      const token_exchange_base_url = `https://graph.accountkit.com/${ACCOUNT_KIT_API_VERSION}/access_token`;


      const app_access_token = ['AA', app_id, app_secret].join('|');
      const params = {
          grant_type: 'authorization_code',
          code: request.body.code,
          access_token: app_access_token
      };

      // exchange tokens
      const token_exchange_url = `${token_exchange_base_url}?${Querystring.stringify(params)}`;
      Request.get({ url: token_exchange_url, json: true }, (err, resp, respBody) => {
          const view = {
              user_access_token: respBody.access_token,
              expires_at: respBody.expires_at,
              user_id: respBody.id,
          };

          const appsecret_proof = crypto.createHmac('sha256', app_secret)
              .update(view.user_access_token)
              .digest('hex');
          const me_endpoint_url = `${me_endpoint_base_url}?appsecret_proof=${appsecret_proof}&access_token=${respBody.access_token}`;
          Request.get({ url: me_endpoint_url, json: true }, (err, resp, respBody) => {
              view.user_id = respBody.phone.number;
              response.json(view);
          });

      });

  });


}

export default AccountKit;


