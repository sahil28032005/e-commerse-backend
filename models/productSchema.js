const categorySchema = require('./categorySchema');
const mongoose = require('mongoose');
const productSchema = mongoose.Schema({
    name: {
        type: 'string',
        required: true,
    },
    description: {
        type: 'string',
        required: true,
    },
    slug: {
        type: 'string',
        required: true
    },
    price: {
        type: 'number',
        required: true
    },
    category: {
        type: mongoose.ObjectId,
        ref: categorySchema,
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    shipping: {
        type: Boolean,
        required: true
    },
    photos: [{
        type: String,
        required: true,
    }]
    // photos: [{
    //     data: Buffer,
    //     contentType: String,
    // }]
}, { timestamps: true });
module.exports = mongoose.model('products', productSchema);