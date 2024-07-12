const mongoose = require('mongoose');
const users = require('./userSchema');
const productSchema = require('./productSchema');
const cartSchema = mongoose.Schema({
    userId: {
        type: mongoose.ObjectId,
        ref: users,
        required: true
    },
    products: [{
        productId: {
            type: mongoose.ObjectId,
            ref: productSchema,
            required: true
        },
        quantity: {
            type: Number,
            default: 1
        }
    }

    ]

}, { timestamps: true });

module.exports = mongoose.model('cart', cartSchema);