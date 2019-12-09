const mongoose = require('mongoose')

const CheckoutSchema = new mongoose.Schema({
    product: {
        type: String
    },
    quantity: {
        type: Number
    },
    totalAmount: {
        type: Number
    },
    dateAdded: {
        type: Date,
        default: new Date(new Date().getMonth() + 1 + '/' + new Date().getDate() + '/' + new Date().getFullYear())
    },
    timestamp: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Checkout', CheckoutSchema)