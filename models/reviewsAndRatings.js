const mongoose = require('mongoose');
const userSchema = require('./userSchema');
const reviewsSchema = mongoose.Schema({
    user: {
        type:mongoose.ObjectId,
        ref: userSchema,
        required: true
    },
    product:{
        type: 'string',
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