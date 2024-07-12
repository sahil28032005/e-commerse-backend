const mongoose = require('mongoose');
const { Schema } = mongoose;
const categories = new Schema({
    name: {
        type: String,
        required: true
    },
    slug:{
        type:String,
        lowercase:true
    }
});

module.exports=mongoose.model("categoryModel",categories);//exporting schema