const _data   = require('./data')
const helpers = require('./helpers')

const routes = (data, callback) => {
    const acceptableMethods = [ 'post', 'get', 'put', 'delete' ]
    if(acceptableMethods.indexOf(data.method) > -1){
        tokens._tokens[data.method](data, callback)
    }else{
        callback(405)
    }
}
/**
 * 
 * required data: 
 * email
 * password
 * 
 * user methods
 * @param {*} data 
 * @param {*} callback
 * 
 */
const post = (data, callback) => {

    // extract the data from the payload
    const {email, password} = data.payload

    // check all required fields
    const _email    = typeof(email)    == 'string' && email.trim().length    > 0 ? email.trim()    : false
    const _password = typeof(password) == 'string' && password.trim().length > 0 ? password.trim() : false

    /**
     * get the hashed data
     */
    const userId         = helpers.md5hash(_email)  //get the userId from the hashed email
    const hashedPassword = helpers.hash(_password)  //hash the password & compare to what is on file

    if(!userId && !_email && !_password) {
        callback(400, {'Error': 'Missing required fields'})
        return
    }

    _data.read('users', userId, (err, userData) => {

        if(!err && userData){

            // can't do nothing without a Password
            if (hashedPassword == userData.hashedPassword) {
                //create new token & set expiratin date 1 hour in the future
                const tokenId = helpers.createRandomString(20)
                // const expires = Date.now() + 1000 * 60 * 60
                const expires = Date.now() + 1000 * 60 * 60 * 24
                const tokenObject = {
                    id: tokenId,
                    userId:  userId,
                    expires: expires
                }

                _data.create('tokens', tokenId, tokenObject, err => {
                    if (!err){
                        callback(200, tokenObject)
                    } else {
                        callback(500, {Error: 'Could not create the Token'})
                    }
                })
            } else {
                callback(400, {'Error': 'Password did not match to what is on file' })
                return
            }
        } else {
            // User doesn't exist
            callback(400, {'Error': 'User does not exist'})
        }
    })
}
/**
 * Users - get
 * Required data: tokenId
 * Optionsal data: none
 * @TODO Only let an authenticate user gat to the data
 *       Don't let the user access anybody elses
 * @param {*} userData 
 * @param {*} callback 
 */
const get = (userData, callback) => {

    const idObj = helpers.trimKeySpaces(userData.query)
    const id    = typeof(idObj.id) == 'string' && idObj.id.length == 20 ? idObj.id : false

    if (id){
        //lookup the token
        _data.read('tokens', id, (err, tokenData) => {
            if (!err && tokenData){
                callback(200, tokenData)
            } else {
                callback(404, {Error: 'Token not found'})
            }
        })
    } else {
        callback(403, {Error: 'Missing required field'})
    }
}

/**
 * Tokens - put
 * required data: id, extend
 * optional data: none
 * @param data 
 * @param callback 
 */
const put = (data, callback) => {

    // extract the payload data
    const { id, extend } = data.payload

    // check for a valid id number
    const _id     = typeof(id)     == 'string'  && id.trim().length == 20  ? id.trim() : false
    const _extend = typeof(extend) == 'boolean' && extend == true          ? true      : false

    if (_id && _extend) {
        // lookup the token
        _data.read('tokens', _id, (err, tokenData) => {
            if (!err && tokenData) {
                // make sure the token data isn't already expired
                if(tokenData.expires > Date.now()) {
                    //extend the token's expiration by an hour
                    tokenData.expires = Date.now() + 1000 * 60 * 60 * 24
                    //store the new updates
                    _data.update('tokens', _id, tokenData, err => {
                        if (!err) {
                            callback(200, {Success: 'The token has been successfully extended by an hour'})
                        } else {
                            callback(500, {Error: 'Could not update the token\'s expiration'})
                        }
                    })
                } else {
                    callback(400, {'Error': 'The token has already expired and can not be extended'})
                }
            } else {
                callback(400, {Error: 'Specified token does not exist'})
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
    // check for a valid phone number
    const id = typeof(data.query.id) == 'string' && data.query.id.trim().length == 20
             ? data.query.id.trim()   : false

    if (!id){
        callback(400, {Error: 'Missing the required id field'})
        return
    }

    //lookup the user's token
    _data.read('tokens', id, (err, data) => {
        if (!err && data){
            //user found, now delete it
            _data.delete('tokens', id, err => {
                if (!err) {
                    callback(200, {Success: 'Token removed successfully'})
                } else {
                    callback(500, {Error: 'Internal error, could not delete the token record'})
                }
            })
        } else {
            callback(403, {Error: 'Token not found'})
        }
    })
}

/**
 *
 * verify if a given token id is currently valid for a given user
 * 
 * @param {*} userId    user's id
 * @param {*} token     user's token
 * @param {*} callback  valid toke indicator
 */
const verifyToken = (userId, token, callback) => {
    // lookup the token
    _data.read('tokens', token, (err, tokenData) => {
        if (!err && tokenData){
            //check that the token is the user's and the token has not expired
            if (tokenData.userId == userId && tokenData.expires > Date.now()) {
                callback(true)
            } else {
                callback(false)
            }
        } else {
            callback(false)
        }
    })
}

module.exports = tokens = {
    notFound: (data, callback) => callback(404),
     _tokens:  {
        post: post,
         get: get,
         put: put,
      delete: _delete,
    },
    verifyToken: verifyToken,
    token:     routes
}
