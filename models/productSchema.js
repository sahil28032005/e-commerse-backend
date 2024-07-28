const mongoose = require('mongoose');
const categorySchema = require('./categorySchema');
const reviewsAndRatings = require('./reviewsAndRatings');
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
    }],
    reviews: [{
        type: mongoose.ObjectId,
        ref: reviewsAndRatings
    }],
    reviewsTotal: {
        type: Number,
        default: 1
    },
    averageRating: {
        type: Number
    },
    oneStar:{
        type:Number
    },
    twoStar:{
        type:Number
    },
    threeStar:{
        type:Number
    },
    fourStar:{
        type:Number
    },
    fiveStar:{
        type:Number
    },

}, { timestamps: true });
module.exports = mongoose.model('products', productSchema);