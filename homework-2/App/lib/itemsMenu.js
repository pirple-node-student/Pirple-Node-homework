// Dependencies
const _data   = require('./data')
const auth    = require('./auth')
const helpers = require('./helpers')

const routes = (data, callback) => {
    const acceptableMethods = [ 'get' ]
    if(acceptableMethods.indexOf(data.method) > -1){
        itemsMenu._itemsMenu[data.method](data, callback)
    }else{
        callback(405)
    }
}

/**
 * Users - get
 * Required data: userId
 * Optionsal data: none
 * @TODO Only let an authenticate user gat to the data
 *       Don't let the user access anybody elses
 * @param {} data 
 * @param {*} callback 
 */
const get = (data, callback) => {
    // extract the data from the payload
    const {email} = data.query
    const {token} = data.headers

    auth.verifyUser(email, token, err => {
        if(!err) {
            getItemsList(data, callback)
        } else {
            callback(403, {Error: 'MENUITEMS::GET Can not validate the user, token might have expired'})
        }
    })
}

const getItemsList = (data, callback) => {
    //lookup the cart
    console.log('Menu items list')
    _data.read('items', 'items', (err, itemsData) => {
        if (!err && itemsData){
            let counter = 1
            itemsData.forEach(item => {
                console.log(counter++, 'Name:',item.itemName, 'Qty:', item.Qty, 'Price:', item.Price)
            });
            callback(200)
        } else {
            callback(404, {Error: 'cart not found'})
        }
    })
} 

module.exports = itemsMenu = {
    notFound: (data, callback) => callback(404),
    _itemsMenu:  { get: get, },
    item: routes
}

