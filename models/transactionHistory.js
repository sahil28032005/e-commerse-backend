const mongoose = require('mongoose');
const userSchema = require('./userSchema');
const { Schema } = mongoose;
const transactionHistory = mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: userSchema,
        required: true
    },
    amount: {
        type: 'number',
        required: true
    },
    payment_method: {
        type: 'string',
        default: "card"
    },
    status: {
        type: 'string',
        default: "pending",
    },
    transaction_id: {
        type: 'string',
        default: "payment failed",
    }
}, { timestamps: true });
module.exports = mongoose.model('transactions', transactionHistory);