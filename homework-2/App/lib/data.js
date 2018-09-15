const fs = require('fs')
const path = require('path')
const helpers = require('./helpers')

const lib = {
    baseDir: path.join(__dirname, '/../.data/'),

    create: (dir, file, data, callback) => {
        fs.open(lib.baseDir + dir + '/' + file + '.json', 'wx', (err, fileDescriptor) => {
            if (!err && fileDescriptor){
                // convert data to string
                const stringData = JSON.stringify(data)

                // write to file and close it
                fs.writeFile(fileDescriptor, stringData, err => {
                    if (!err){
                        fs.close(fileDescriptor, err => {
                            if (!err){
                                callback(false)
                            }else{
                                callback('Error closing new file')
                            }
                        })
                    } else {
                        callback('Error writing to new file')
                    }
                })
            } else {
                callback('Error creating the new file, it may already exist')
            }
        })
    },

    read: (dir, file, callback) => {
        fs.readFile(lib.baseDir+dir+'/'+file+'.json', 'utf8', (err, data) => {
            if (!err) {
                const parsedData = helpers.parseJasonToObject(data)
                callback(false, parsedData)
            } else {
                callback(err, data)
            }
        })
    },

    update: (dir, file, data, callback) => {
        fs.open(lib.baseDir+dir+'/'+file+'.json', 'r+', (err, fileDescriptor) => {
            if (!err && fileDescriptor){
                // convert data to string
                const stringData = JSON.stringify(data)

                // now truncate the contents of the file
                fs.truncate(fileDescriptor, err => {
                    if(!err){
                        //write to the file and close it
                        fs.writeFile(fileDescriptor, stringData, err => {
                            if (!err){
                                fs.close(fileDescriptor, err => {
                                    if (!err) {
                                        callback(false)
                                    } else {
                                        callback('Error closng the file')
                                    }
                                })
                            } else {
                                callback('Error writing to existing file')
                            }
                        })
                    }else{
                        callback('Error truncating file')
                    }
                })
            } else {
                callback('Error, could not open file for update, it might not exist yet')                
            }
        })
    },

    delete: (dir, file, callback) => {
        fs.unlink(lib.baseDir+dir+'/'+file+'.json', err => {
            if(!err){
                callback(false)
            } else {
                callback('Error deleting the file')
            }
        })
    },

    // List all the items in a directory
    list: (dir, callback) => {
        fs.readdir(lib.baseDir + dir + '/', (err, data) => {
            if(!err && data && data.length > 0) {
                const trimmedFileNames = []
                data.forEach(fileName => {
                    trimmedFileNames.push(fileName.replace('.json', ''))
                });
                callback(false, trimmedFileNames)
            } else {
                callback(err, data)
            }
        })
    }
}

module.exports = lib