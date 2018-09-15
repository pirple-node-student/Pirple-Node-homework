/**
 * stripeCharge email handler
 * Dependencies
 */
const https       = require('https')
const config      = require('./config')
const querystring = require('querystring')

 // Charge a credit card with Stripe
const Charge = (amount, callback) => {
    // validate parameters
    amount = typeof(amount) === "number" && amount > 0 ? amount : false;

    if (amount) {
        // Configure the request payload
        const payload = {
            'amount'  : parseInt(amount.toFixed(2) * 100),
            'currency': 'usd',
            'source'  : 'tok_amex'
        };

        // Stringfy the payload
        const stringPayload = querystring.stringify(payload);
        
        // Configure the request details
        let requestDetails = {
            'protocol' : 'https:',
            'hostname' : 'api.stripe.com',
            'method'   : 'POST',
            'path'     : '/v1/charges',
            'auth'     : config.stripeChargeCredential,
            'headers'  : {
                'Content-type'   : 'application/x-www-form-urlencoded',
                'Content-length' : Buffer.byteLength(stringPayload)
            }
        };

        // Instantiate the request object
        let req = https.request(requestDetails, res => {
            // Grab the status of the sent request
            const status = res.statusCode;
            // Callback successfuly if the request went through
            if (status == 200 || status == 201) {
                callback(false);
            } else {
                callback('Status code returned was '+ status);
            }
        });
        

        // Bind to the error event so it doesn't get thrown
        req.on('error', e => {
            callback(e);
        });

        // Add the payload
        req.write(stringPayload);

        // End the request
        req.end();

    } else {
        callback('Given parameters are missing or invalid.');
    }
 };
 
// Export the module
module.exports = payment = {
    Charge: Charge
}
