const mongoose = require('mongoose');
const { Schema } = mongoose;

//sub-schema for referenceing sub categories
const subCategory = new Schema({
    name: String,
    default: { type: String, default: "other" },
    reviewsCategory: [{
        type: String
    }]
});
const categories = new Schema({
    name: {
        type: String,
        required: true
    },
    slug: {
        type: String,
        lowercase: true
    },
    subCategories: [{
        type: subCategory
    }]
});

const subCat = module.exports = mongoose.model('subCategories', subCategory);
const cat = module.exports = mongoose.model("categoryModel", categories);
module.exports = { subCat, cat };