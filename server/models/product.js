const mongoose = require('mongoose')

const ProductSchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    category: {
        type: String,
        required: true
    },
    dateAdded: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Product', ProductSchema)