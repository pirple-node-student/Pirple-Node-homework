/**
 * helpers for various tasks
 */
const crypto = require('crypto')
const config = require('./config')

const hashSHA256 = str => {
     if(typeof(str) == 'string' && str.length > 0){
         return crypto.createHmac('sha256', config.hashSecret).update(str).digest('hex')
     } else {
         return false
     }
}

const md5hash = str => {
    if(typeof(str) == 'string' && str.length > 0){
        return crypto.createHash('md5').update(str).digest('hex');
    } else {
        return false
    }
}

const parseJsonObject = buffer => {
    // parse a json string to an object in all cases without throwing an error
    try{
        return JSON.parse(buffer)
    }catch(e){
        return {}
    }
}

const createRandomString = strLength => {
    strLength = typeof(strLength) == 'number' && strLength > 0
              ? strLength : false
    if (strLength) {
        // define all the possible characters the can go in a string
        const possibleCharacters = 'abcdefghijklmnopqrstuvwxyz0123456789'
        let str = ''
        for(i = 1; i <= strLength; i++){
            const randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))
            str += randomCharacter
        }

        // return the final string
        return str
    } else {
        return false
    }
}

const trimKeySpaces = buffer => {
    let str = JSON.stringify(buffer)
    str=str.replace(/\s/g, '')
    return parseJsonObject(str)
}

module.exports = helpers = {
    hash:               hashSHA256,
    md5hash:            md5hash,
    trimKeySpaces:      trimKeySpaces,
    parseJasonToObject: parseJsonObject,
    createRandomString: createRandomString
}

