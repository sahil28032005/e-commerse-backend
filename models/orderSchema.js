const mongoose = require('mongoose');
const productSchema = require('./productSchema');
const userSchema = require('./userSchema');
const { Schema } = mongoose;
const orderSchema = mongoose.Schema({
    transaction_id: {
        type: 'string',
        required: true,
    },
    orders: [{
        product: { type: Schema.Types.ObjectId, ref: productSchema, required: true },
        status: { type: String, default: 'pending' },
        quantity: { type: Number, default: 1 }
    }],
    cancelledProducts: [{ type: Schema.Types.ObjectId, ref: productSchema, required: true }],
    user: {
        type: Schema.Types.ObjectId,
        ref: userSchema,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
    address: {
        type: 'string',
    },
    payment_method: {
        type: 'string',
        default: "card"
    },


}, { timestamps: true });
module.exports = mongoose.model('orders', orderSchema);