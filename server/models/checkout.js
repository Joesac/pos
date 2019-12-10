const mongoose = require('mongoose')

const CheckoutSchema = new mongoose.Schema({
    dateAdded: {
        type: Date,
        default: new Date(new Date().getMonth() + 1 + '/' + new Date().getDate() + '/' + new Date().getFullYear())
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    sale: {
        amountReceived: {
            type: Number
        },
        paymentType: {
            type: String
        },
        products: [{
            name: {
                type: String
            },
            qty: {
                type: Number
            },
            price: {
                type: Number
            }
        }]
    }
})

module.exports = mongoose.model('Checkout', CheckoutSchema)