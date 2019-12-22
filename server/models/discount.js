const mongoose = require('mongoose')

const DiscountSchema = new mongoose.Schema({
    discount: {
        type: Number,
        default: 0,
        enabled: {
            type: Boolean,
            default: false
        }
    },
    conditionalDiscountAmount: {
        type: Number,
        default: 0,
        enabled: {
            enabled: false
        }
    }
})

module.exports = mongoose.model('Discount', DiscountSchema)