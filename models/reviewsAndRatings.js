const mongoose = require('mongoose');
const userSchema = require('./userSchema');
const productSchema = require('./productSchema');
const { Schema } = mongoose;
const reviewsSchema = mongoose.Schema({
    user: {
        type: Schema.Types.ObjectId,
        ref: userSchema,
        required: true
    },
    product:{
        type: Schema.Types.ObjectId,
        ref: productSchema,
        required: true
    },
    starRating: {
        type: 'number',
        required: true,
        min: 1,
        max: 5
    },
    reviewText: {
        type: 'string',
        required: true
    },
    photoUrl: {
        type: 'string',
        required: false
    }
});
module.exports = mongoose.model('reviews', reviewsSchema);