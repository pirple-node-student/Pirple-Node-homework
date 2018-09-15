const auth    = require('./auth')
const _data   = require('./data')
const helpers = require('./helpers')

const routes = (data, callback) => {
    const acceptableMethods = [ 'post', 'get', 'put', 'delete' ]
    if(acceptableMethods.indexOf(data.method) > -1){
        carts._carts[data.method](data, callback)
    }else{
        callback(405)
    }
}

/**
 * 
 * required data: 
 * email
 * userId       the file name
 * items        array
 *
 * user methods
 * @param {*} data 
 * @param {*} callback
 * 
 */
const post = (data, callback) => {
    // extract the data from the payload
    const {email} = data.payload
    const {token} = data.headers

    auth.verifyUser(email, token, err => {
        if(!err) {
            createCart(data, callback)
        } else {
            callback(500, {Error: "CARTS::POST Can not verify the credentials for the user"})
        }
    })
}


/**
 * this function reads the first 25 items from the Items.json file & returns them for storage into the cart list of items
 * this function will eventually use a database like mongoDB
 */
const getItems = () => {

    let i = 0
    let purchaseItems = []
    _data.read('items', 'items', (err, itemsData) => {
        if(!err && itemsData) {
            itemsData.forEach(item => {
                if ( i++ < 25) {
                    const itemObj = {
                        item:  item.itemName,
                        qty:   item.Qty ,
                        price: item.Price
                    }
                    purchaseItems.push(itemObj)
                }
            })
        } else {
            console.log(err)
        }
    })
    return purchaseItems
}

const getCartItems = (userId) => {
    _data.read('carts', userId, (err, itemsData) => {
        const {items} = itemsData
        return items
    })
}

const createCart = (data, callback) =>{

    // extract the data from the payload
    const {email, items} = data.payload

    const _email = typeof(email) == 'string'  && email.trim().length   > 0 ? email.trim() : false
    const _items = typeof(items) == 'object'  && items instanceof Array && items.length  > 0 ? items : false
    
    // get the hashed id
    const userId = helpers.md5hash(_email)

    // when the required data is non-existent, return an error, otherwise continue creating the cart
    if(!userId || !_items) {
        callback(400, {'Error': 'CARTS::POST::createCart Missing required cart fields'})
        return
    }

    //for now create new cart
    const cartId = userId

    const purchaseItems = getItems() // get the items from the jason file

    const cartObject = {
        userId: userId,             //userId,
        items: purchaseItems       //get the items from the json file
    }

    _data.create('carts', cartId, cartObject, err => {
        if (!err){
            callback(200, cartObject)
        } else {
            callback(405, {Error: 'CARTS::POST::createCart error creating the new file, it may already exist'})
        }
    })
}

/**
 * Users - get
 * Required data: email, token from the headers
 * Optionsal data: none
 * @TODO Only let an authenticate user gat to the data
 *       Don't let the user access anybody elses
 * @param {*} userData 
 * @param {*} callback 
 */
const get = (data, callback) => {
    // extract the data from the payload
    const {email} = data.query
    const {token} = data.headers

    auth.verifyUser(email, token, err => {
        if(!err) {
            getCart(data, callback)
        } else {
            callback(403, {Error: 'CARTS::GET Can\'t validate the user, token might have expired'})
        }
    })
}

const getCart = (data, callback) => {

    const {email} = helpers.trimKeySpaces(data.query)
    const id = helpers.md5hash(email)

    if (id){
        //lookup the cart
        _data.read('carts', id, (err, cartData) => {
            if (!err && cartData){
                callback(200, cartData)
            } else {
                callback(404, {Error: 'cart not found'})
            }
        })
    } else {
        callback(403, {Error: 'Missing required field'})
    }
}

/**
 * carts - put
 * required data: email, token
 * optional data: none
 * @param data 
 * @param callback 
 */
const put = (data, callback) => {

    // Collect the data from a web page or browser
    const { email } = data.payload
    const { token } = data.headers

    auth.verifyUser(email, token, err => {
        if(!err) {
            putCart(data, callback)
        } else {
            console.log(err, 'err')
            callback(500, {Error: 'CARTS::PUT Can\'t validate the user'})
        }
    })
}

const putCart = (data, callback) => {

    // Collect the data from a web page or browser
    const { items, email } = data.payload

    // check for the optional fields
    const _email = typeof(email) == 'string' && email.trim().length > 0 ? email.trim()  : false
    const _items = typeof(items) == 'object' && items instanceof Array && items.length  > 0 ? items : false

    const id = helpers.md5hash(_email)

    if (id) {
        // lookup the cart
        _data.read('carts', id, (err, cartData) => {
            if (!err && cartData) {

                const itemsObject = {
                    userId: id,
                    items: _items
                }

                _data.update('carts', id, itemsObject, err => {
                    if(!err) {
                        callback(200, {info: 'CARTS::PUT::putCart Items array updated'})
                    } else {
                        callback(500, {Error: 'CARTS::PUT::putCart unable to update the cart items'})
                    }
                })

            } else {
                callback(400, {Error: 'Specified cart does not exist'})
            }
        })
    } else {
        callback(400, {Error: 'Missing or invalid fields'})
    }
}

/**
 * 
 * Delete a verified user
 * 
 * @param {*} data 
 * @param {*} callback 
 */
const _delete = (data, callback) => {
    // Collect the data from a web page or browser
    const { email } = data.payload
    const { token } = data.headers

    auth.verifyUser(email, token, err => {
        if(!err) {
            deleteCart(data, callback)
        } else {
            console.log(err, 'err')
            callback(500, {Error: 'CARTS::PUT Can\'t validate the user'})
        }
    })
}

const deleteCart = () => {
    // check for a valid phone number
    const id = typeof(data.query.id) == 'string' && data.query.id.trim().length > 0 ? data.query.id.trim()   : false

    if (!id){
        callback(400, {Error: 'Missing the required id field'})
        return
    }

    //lookup the user's cart
    _data.read('carts', id, (err, data) => {
        if (!err && data){
            //user found, now delete it
            _data.delete('carts', id, err => {
                if (!err) {
                    callback(200, {Success: 'cart removed successfully'})
                } else {
                    callback(500, {Error: 'Internal error, could not delete the cart record'})
                }
            })
        } else {
            callback(403, {Error: 'cart not found'})
        }
    })
}

module.exports = carts = {
    notFound: (data, callback) => callback(404),
    _carts:  {
        post: post,
         get: get,
         put: put,
      delete: _delete,
    },
    getCartItems: getCartItems,
    cart:     routes
}

