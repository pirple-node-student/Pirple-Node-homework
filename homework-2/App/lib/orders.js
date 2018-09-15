// Dependencies
const _data   = require('./data')
const auth    = require('./auth')
const mailer  = require('./mailgun')
const helpers = require('./helpers')
const payment = require('./stripeCharge')

const routes = (data, callback) => {
    const acceptableMethods = [ 'post' ]
    if(acceptableMethods.indexOf(data.method) > -1){
        orders._orders[data.method](data, callback)
    }else{
        callback(405)
    }
}

// let order = {
//     'id': String, // Unique ID.
//     'userId': String,
//     'items': [{itemId, quantity}],
//     'paid': Boolean, // true after success payment received.
// }
const post = (data, callback) => {

    // Collect the data from a web page or browser
    const { email } = data.payload
    const { token } = data.headers

    auth.verifyUser(email, token, err => {
        if(!err) {
            createOrder(data, callback)
        } else {
            console.log(err, 'err')
            callback(500, {Error: 'ORDERS::POST Can not validate the user ' + err})
        }
    })
}

const createOrder = (data, callback) => {

    // Get the emal from the payload
    const {email} = data.payload

    const _email = typeof(email) == 'string'  && email.trim().length   > 0 ? email.trim() : false

    // get the userId to Lookup the cart
    const userId = helpers.md5hash(_email)

    // get the cart data
    _data.read('carts', userId, (err, userData) => {

        if (!err && userData) {

            // extract the items array
            const {items} = userData

            const cartItems = typeof(items) == 'object' && items instanceof Array ? items : [];

            if (cartItems.length > 0) {
                // Get item prices
                let totalAmount = 0;

                cartItems.map( cartItem => {
                    // Calculates the total of this item based on the quantity
                    totalAmount += cartItem.price * cartItem.qty;
                });

                console.log('totalamount', totalAmount)

                payment.Charge(totalAmount, err => {
                    if (!err) {
                        console.log('payment accepted')
                        // Clean user's cart
                        userData.items = [];
                        // Save the new user data
                        _data.update('carts', userId, userData, err => {
                            if (!err) {
                                _data.read('users', userId, (err, userData) => {
                                    if(!err && userData) {

                                        // Send e-mail with a receipt
                                        const toEmail = userData.email
                                        const toName  = userData.name//userData.firstName + " " +userData.lastName; 
                                        const subject = "Your Pizza Receipt"; 
                                        const message = "Gracias " + toName + ", su compra de $" + totalAmount.toFixed(2) + " de Pizza a sido preparada.";
                        
                                        mailer.Send(toEmail, toName, subject, message, err => {
                                            if (!err) {
                                                console.log('email has been sent')
                                                callback(200, {Info: 'email has been sent'});
                                            } else {
                                                callback(500, {'Error' : 'Unable to send receipt via e-mail ' + err});        
                                            }
                                        });

                                    } else {
                                        callback(500, {Error: 'Can not read the user data fle to send an email'})
                                    }

                                })
                            } else {
                                callback(500, {'Error': 'Could not cleanup user\'s cart.'});
                            }
                        });
                    } else {
                        callback(500, {'Error' : 'Unable to charge credit card in Stripe: '+ err});
                    }
                })
            } else {
                callback(500, {'Error': 'Shopping cart is empty. To place an order there must be at least one item in the cart.'});
            }
        } else {
            callback(403);
        }
    });
    
}

module.exports = orders = {
    notFound: (data, callback) => callback(404),
    _orders:  { post: post, },
    order:     routes
}
