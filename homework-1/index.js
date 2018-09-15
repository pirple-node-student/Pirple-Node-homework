/**
 * Date:    19-Aug-18
 * Author:  Luis-Carlos Rodriguez
 * Module:  index.js
 * Purpose: To show how to respond to a url/hello api request
 *          using a rest response
 */
const http = require('http')
const url = require('url')
const stringDecoder = require('string_decoder').StringDecoder

// API request responses
const Server = http.createServer((req, res) => {

    const parsedUrl = url.parse(req.url, true)
    const path      = parsedUrl.pathname.replace(/^\/*|\/+$/g, '')
    const decoder   = new stringDecoder('utf-8')

    let buffer = ''
    req.on('data', (data) => {
        buffer += decoder.write(data)
    })

    req.on('end', () => {

        buffer += decoder.end()
        /**
         * Choose the handler this request should go to.
         * If one is not found, use the notFound handler
         */
        const chosenHandler = typeof(router[path]) !== 'undefined' 
                            ? router[path] : handlers.notFound
        /**
         * Construct the data object
         */
        const data = {
            path:    path,
            payload: buffer
        }
        /**
         * Route the request to the handler specified in the router
         */
        chosenHandler(data, (statusCode, payload)=>{
            //use status
            statusCode = typeof(statusCode) == 'number' 
                       ? statusCode : 200
            
            /**
             * use the payload called back by the handler
             * or default to an empty object
             */
            payload = typeof(payload) == 'object'
                    ? payload : {}

            const payloadString = JSON.stringify(payload)

            // return the response
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(statusCode)
            res.end(payloadString)
            // res.end({name: 'Hello to my Node World'})        
        })

    })
})

// server listening port
Server.listen(3000, () => {
    console.log('Listening on port: 3000')
})


const handlers = {
    hello:  (data, callback) => callback(200, {'hello response': 'Welcome to my Node world' }),
    notFound: (data, callback) => callback(404),
}

const router = {
    hello:   handlers.hello,
}
