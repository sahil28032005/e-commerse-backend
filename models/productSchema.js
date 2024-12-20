const mongoose = require('mongoose');
const { subCat, cat } = require('./categorySchema');
const reviewsAndRatings = require('./reviewsAndRatings');
const colorOptionsSchema=mongoose.Schema(
    {
        color:{
            type:String,
            required:true,
        },
        photos:[{
            type:String,
            required:true,
        }]
    }
);
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
        ref: cat,
        required: true
    },
    subCategory: {
        type: mongoose.ObjectId,
        ref: subCat
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
    oneStar: {
        type: Number
    },
    twoStar: {
        type: Number
    },
    threeStar: {
        type: Number
    },
    fourStar: {
        type: Number
    },
    fiveStar: {
        type: Number
    },
    subSecReviewsPercent: [
        { type: Number }
    ],
    initialColor: {
        type: String,
        required: true
    }

}, { timestamps: true });
module.exports = mongoose.model('products', productSchema);