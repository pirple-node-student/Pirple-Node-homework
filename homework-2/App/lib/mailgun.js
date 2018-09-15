/**
 * mailgun email handler
 * Dependencies
 */
const https       = require('https')
const config      = require('./config')
const querystring = require('querystring')

// send and email message to the buyer
const Send = (toEmail, toName, subject, message, callback) => {

    // validate parameters
    toEmail = typeof(toEmail) === 'string' && toEmail.trim().length > 0 ? toEmail.trim() : false;
    toName  = typeof(toName)  === 'string' && toName.trim().length  > 0 ? toName.trim()  : false;
    subject = typeof(subject) === 'string' && subject.trim().length > 0 ? subject.trim() : false;
    message = typeof(message) === 'string' && message.trim().length > 0 ? message.trim() : false;
    
    if (toEmail && toName && message) {
        // Configure the request payload
        const payload = {
            'from'    : 'Pizza App <postmaster@sandbox.mailgun.org>',
            'to'      : toEmail,
            'subject' : subject,
            'text'    : message
        };

        // Stringfy the payload
        const stringPayload = querystring.stringify(payload);
        
        // Configure the request details
        const requestDetails = {
            'protocol' : 'https:',
            'hostname' : 'api.mailgun.net',
            'method'   : 'POST',
            'path'     : '/v3/sandbox.mailgun.org/messages',
            'auth'     : config.mailgunCredential,
            'headers'  : {
                'Content-type'   : 'application/x-www-form-urlencoded',
                'Content-length' : Buffer.byteLength(stringPayload)
            }
        };

        // Instantiate the request object
        const req = https.request(requestDetails, res => {
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

        console.log('stringPayload', stringPayload)
        // Add the payload
        req.write(stringPayload);

        // End the request
        req.end();

    } else {
        callback('Given parameters are missing or invalid.');
    }
};
 
// Export the module
module.exports = email = {
    Send: Send
}
