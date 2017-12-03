/**
 * Main application routes
 */

'use strict';

import errors from './components/errors';
import path from 'path';

import IP from './api/IP'
import sponsor from './api/sponsor'
import loading from './api/loading'
import payment from './api/payment'

export default function(app) {
    // Insert routes below

    app.use('/api/users', require('./api/user'));

    app.use('/api/status', (req,res)=>res.json({time:new Date()}));

    app.use('/api/auth', require('./auth').default);

    IP.route(app);
    sponsor.route(app);
    loading.route(app);
    payment.route(app);

    // All undefined asset or api routes should return a 404
    app.route('/:url(api|auth|components|app|bower_components|assets)/*')
        .get(errors[404]);



    // All other routes should redirect to the index.html
    app.route('/*')
        .get((req, res) => {
            if (!process.env.SKIP_ASSETS)
                res.sendFile(path.resolve(app.get('appPath') + '/index.html'));
            else
                res.json("ok")
        });
}
