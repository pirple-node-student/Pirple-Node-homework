/**
 * 
 * create/export environment vars
 * 
 */
const environments = {
    staging: {
        httpPort:   3000,
        httpsPort:  3001,
        maxChecks:  5,
        envName:    'staging',
        hashSecret: 'thisIsASecret',
        twilio: {
            accountSid: '',
            authToken:  '',
            fromPhone:  ''
        },
        mailgunCredential: '',
        stripeChargeCredential: '',
    },
    production:{
        httpPort:   5000,
        httpsPort:  5001,
        maxChecks:  5,
        envName:    'production',
        hashSecret: 'thisIsAlsoASecret',
        twilio: {
            accountSid: process.env.TWILIO_ACCOUNT_SID,
            authToken:  process.env.TWILIO_AUTH_TOKEN,
            fromPhone:  process.env.TWILIO_FROM_PHONE_NUMBER
        },
        mailgunCredential:      '',
        stripeChargeCredential: '',
    }
}
    
// here to determina which env to use
const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : ''
// here to check the env existance
const environmentToExport = typeof(environments[currentEnvironment]) == 'object'  ? environments[currentEnvironment] : environments.staging

module.exports = environmentToExport 
