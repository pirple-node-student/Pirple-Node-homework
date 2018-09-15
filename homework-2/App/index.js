/**
 * 
 * Date:        05-Sept-2018
 * Author:      LC Rodriguez
 * Module:      index.js
 * Description: Homework #2 main driver
 * 
 */

// Dependencies
const server  = require('./lib/server')

const init = () => {
    // start the server
    server.init()
 }

 init()         // Start the HTTP server


 module.exports = app = {
    init: init,
}
