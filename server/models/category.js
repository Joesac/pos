const mongoose = require('mongoose')

const CategorySchema = new mongoose.Schema({
    name: {
        type: String,
        unique: true,
        required: true
    },
    dateAdded: {
        type: Date,
        default: Date.now
    }
})

module.exports = mongoose.model('Category', CategorySchema)