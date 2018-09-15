const _data   = require('./data')
const helpers = require('./helpers')

const routes = (data, callback) => {
    const acceptableMethods = [ 'post', 'get', 'put', 'delete' ]
    if(acceptableMethods.indexOf(data.method) > -1){
        users._users[data.method](data, callback)
    }else{
        callback(405)
    }
}
/**
 * user methods
 * @param {*} data 
 * @param {*} callback
 * 
 * required data: 
 * firstName
 * lastName
 * phone
 * password
 * tosAgreement 
 * 
 * 'id': String,   // md5 hash of email for data file name.
 *  'name': String,
 *  'email': String,
 *  'address': String,
 *  'hashedPassword': String
}
 * optional data: none
 */
const post = (data, callback) => {
    /**
     * Collect the data from a web page or browser
     */

    
    // extract the required fields from the payload buffer
    const { name, email, address, password } = data.payload

    // check all required fields
    const _name     = typeof(name)     == 'string' && name.trim().length     > 0 ? name.trim()     : false
    const _email    = typeof(email)    == 'string' && email.trim().length    > 0 ? email.trim()    : false
    const _address  = typeof(address)  == 'string' && address.trim().length  > 0 ? address.trim()  : false
    const _password = typeof(password) == 'string' && password.trim().length > 0 ? password.trim() : false

    /**
     * make sure there is data present
     */
    if(!_name && !_email && !_address && !_password) {
        callback(400, {'Error': 'One or more required fields are missing'})
        return
    }

    /**
     * Store the Browser data on the disk
     */
    const userId = helpers.md5hash(email)

    _data.read('users', userId, (err, data) => {
        if(err){
            //hash the password
            const hashedPassword = helpers.hash(password)

            // can't do nothing without a Password
            if (!hashedPassword) {
                callback(500, {'Error': 'Couldn\'t hash the user\'s password' })
                return
            }

            // Create the user object
            const userObject = {
                userId        : userId,
                name          : _name,
                email         : _email,
                address       : _address,
                hashedPassword: hashedPassword
            }
            _data.create('users', userId, userObject, (err) => {
                if(!err){
                    callback(200, {'Success': 'user ' + _email + ' has been created'})
                }else{
                    callback(500, {'Error': 'could not create the user'})
                }
            })
        }else{
            // User already exists
            callback(400, {'Error': 'User already exists'})
        }
    })
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

    // collect the phone number from the url query string
    const {email} = data.query
    const _email = typeof(email) == 'string' && email.trim().length > 0 ? email.trim()   : false

    /**
     * get the hashed id
     */
    const _userId = helpers.md5hash(_email)

    if (_userId){
        _data.read('users', _userId, (err, data) => {
            if (!err && data){
                //remove the user password for display purposes
                delete data.hashedPassword
                callback(200, data)
            } else {
                callback(404, {Error: 'User not found, users::get'})
            }
        })
    } else {
        callback(403, {Error: 'Missing required field'})
    }
}
/**
 * Users - put
 * Required data: eamil
 * Optionsal data: name, email, address,  password, at least one must be supplied
 * @TODO Only let an authenticate user update their onwn object
 *       Don't let the user access anybody elses
 * @param {} data 
 * @param {*} callback 
 */
const put = (data, callback) => {

    // extract the data fields from the data.payload
    const {name, email, address, password} = data.payload

    // check for valid field types
    const _name     = typeof(name)     == 'string' && name.trim().length     > 0 ? name.trim()     : false
    const _email    = typeof(email)    == 'string' && email.trim().length    > 0 ? email.trim()    : false
    const _address  = typeof(address)  == 'string' && address.trim().length  > 0 ? address.trim()  : false
    const _password = typeof(password) == 'string' && password.trim().length > 0 ? password.trim() : false

    // get the hashed id
    const _userId = helpers.md5hash(_email)

    //  update the disk data with the incoming data. 
    if (_userId) { 
        if (_name || _email || _address || _password){
            //lookup the user by the userId number & update the optional fields if supplied
            _data.read('users', _userId, (err, userData) => {
                if (!err && userData) {
                    //update the fields as necessary
                    if(_name    ){ userData.name           = _name }
                    if(_email   ){ userData.email          = _email }
                    if(_address ){ userData.address        = _address }
                    if(_password){ userData.hashedPassword = helpers.hash(_password) }

                    _data.update('users', _userId, userData, err => {
                        if (!err) {
                            callback(200, {Success: 'Record successfully updated'})
                        } else {
                            callback(500, {Error: 'could not update the user'})
                        }
                    })
                } else {
                    callback(400, {Error: 'the specfied user does not exist'})
                }
            })
        } else {
            callback(400, {Error: 'Missing a field to update'})
        }
    } else {
        callback(400, {Error: 'Missing the required userId field'})
    }
}
/**
 * Users - delete
 * Required data: email
 * @TODO Only let an authenticate user delete his/her onwn object
 *       Don't let the user access anybody elses
 * @param {*} data 
 * @param {*} callback 
 */
const _delete = (data, callback) => {
    // check for a valid phone number
    const email     = typeof(data.query.email)     == 'string' && data.payload.email.trim().length > 0
                    ? data.query.email.trim()        : false

    // get the hashed id
    const _userId = helpers.md5hash(email)

    if (_userId){
        _data.read('users', _userId, (err, data) => {
            if (!err && data){
                //user found, now delete it
                _data.delete('users', _userId, err => {
                    if (!err) {
                        callback(200)
                    } else {
                        callback(500, {Error: 'Internal error, could not delete the user record'})
                    }
                })
            } else {
                callback(400, {Error: 'User not found, users::delete'})
            }
        })
    } else {
        callback(403, {Error: 'Missing the required phone field'})
    }
}

const notFound = (data, callback) => {
    callback(404, {Error: 'User not found'})
}

module.exports = users = {
    notFound: notFound,
    _users:   {
        post: post,
         get: get,
         put: put,
      delete: _delete,
    },
    user:     routes
}

