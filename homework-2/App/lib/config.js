/**
 * 
 * create/export environment vars
 * process.env.TWILIO_ACCOUNT_SID      accountSid: 'AC31e43eac677977230a3fedbfb5c70ed6',
 * process.env.TWILIO_AUTH_TOKEN        authToken:  '95824b3fa5add0befc86531dbcad0367',
 * process.env.TWILIO_FROM_PHONE_NUMBER fromPhone: '+16788469550'
 * process.env.TWILIO_PHONE_NUMBER             To: '+16787698459'
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
            accountSid: 'AC31e43eac677977230a3fedbfb5c70ed6',
            authToken:  '95824b3fa5add0befc86531dbcad0367',
            fromPhone:  '+16788469550'
        },
        mailgunCredential: 'api:f282162ad8bd79eaca40587607ecd5f1-7bbbcb78-926a25b8',
        stripeChargeCredential: 'sk_test_HcHTN8aQqiaTdLkxKAhGXt9Y',
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
        mailgunCredential:      'api:7bbbcb78-926a25b8',
        stripeChargeCredential: 'sk_test_HcHTN8aQqiaTdLkxKAhGXt9Y',
    }
}
    
// here to determina which env to use
const currentEnvironment = typeof(process.env.NODE_ENV) == 'string' ? process.env.NODE_ENV.toLowerCase() : ''
// here to check the env existance
const environmentToExport = typeof(environments[currentEnvironment]) == 'object'  ? environments[currentEnvironment] : environments.staging

module.exports = environmentToExport 