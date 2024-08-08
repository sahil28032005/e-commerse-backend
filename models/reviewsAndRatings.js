const mongoose = require('mongoose');
const userSchema = require('./userSchema');
const { subCat } = require('./categorySchema');
const reviewsSchema = mongoose.Schema({
    user: {
        type: mongoose.ObjectId,
        ref: userSchema,
        required: true
    },
    product: {
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
    },
    subCategory: {
        type: mongoose.ObjectId,
        ref: subCat,
        required: true
    },
    subTypeChild: {
        type: 'string',
        required: true
    }
}, { timestamps: true });
module.exports = mongoose.model('reviews', reviewsSchema);