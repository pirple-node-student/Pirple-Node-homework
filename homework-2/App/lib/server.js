/**
 * Date:        05-Sept-2018
 * Author:      LC Rodriguez
 * Module:      Server.js
 * Description: Homework #2 main driver
 *
 * Dependencies:
 */
const url      = require('url')
const http     = require('http')
const users    = require('./users')
const tokens   = require('./tokens')
const orders   = require('./orders')
const carts    = require('./carts')
const config   = require('./config')
const helpers  = require('./helpers')
const itemsMenu= require('./itemsMenu')

const stringDecoder = require('string_decoder').StringDecoder


// Here to start the HTTP servers
const init = () => {
    // start the HTTP server
    httpServer.listen(config.httpPort, () => {
        console.log('\x1b[91mHTTP Protocol Listening on port:', config.httpPort, '\x1b[0m')
    })
}

//API request responses
const httpServer = http.createServer((req, res) => {
    apiServer(req, res)
})

// Here to handle all of the API call comming in...
const apiServer = (req, res) => {

    const parsedUrl = url.parse(req.url, true)
    const path      = parsedUrl.pathname.replace(/^\/*|\/+$/g, '')
    const query     = parsedUrl.query
    const method    = req.method.toLowerCase()
    const headers   = req.headers
    const decoder   = new stringDecoder('utf-8')

    let buffer = ''
    req.on('data', data => {
        buffer += decoder.write(data)
    })

    req.on('end', () => {
        buffer += decoder.end()

        const chosenHandler = typeof(router[path]) !== 'undefined' 
                            ? router[path] : router.notFound
                            
        const data = {
            path   : path,
            query  : query,
            method : method,
            headers: headers,
            payload: helpers.parseJasonToObject(buffer)
        }
        /**
         * the chosenHandler function has two main arguments
         * 1. the data argument comming in from the request call
         * 2. the callback made up of a. statusCode, b. payload
         *    these arguments of #2 come back here from the called handler or function
         */
        chosenHandler(data, (statusCode, payload) => {
            //use status
            statusCode = typeof(statusCode) == 'number' 
                       ? statusCode : 200
            
            //use payload
            payload = typeof(payload) == 'object'
                    ? payload : {}

            const payloadString = JSON.stringify(payload)

            // return the response
            res.setHeader('Content-Type', 'application/json')
            res.writeHead(statusCode)
            res.end(payloadString)

            console.log('statusCode, payloadString')
            console.log (statusCode, payloadString)
        })
    })
}

const notFound = (data, callback) => {
    callback(404, {Error: 'Path: ' + data.path + ' not found'})
}

const router = {
    notFound:  notFound,
    users:     users.user,
    tokens:    tokens.token,
    orders:    orders.order,
    carts:     carts.cart,
    itemsMenu: itemsMenu.item,
}

module.exports = server = {
    httpServer:   httpServer,
    router:       router,
    init:         init,
}
