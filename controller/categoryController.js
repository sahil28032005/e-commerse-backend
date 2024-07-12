const categoryModel = require('../models/categorySchema');
var slugify = require('slugify')
//for creating category
const categoryController = async (req, res) => {

    try {
        // res.send("success...");
        const { categoryName } = req.body;
        const record = new categoryModel({
            name: categoryName,
            slug: slugify(categoryName)
        });
        const existingCategory = await categoryModel.findOne({ name: categoryName });;
        if (!existingCategory) {
            await record.save();
            // console.log("category inserted in database");
            res.status(200).send({
                success: true,
                message: 'category inserted successfully after role identification....',
                slug: slugify(categoryName)
            });
        }
        else {
            res.status(200).send({
                success: false,
                message: 'category already exists in database'
            });
        }

    }
    catch (error) {
        console.log(error);
        res.status(900).send({
            success: false,
            message: 'category not inserted '
        });
    }
}

//for updaing category
const updateCategory = async (req, res) => {
    try {
        const { updateVal } = req.body;
        const { categoryId } = req.params;
        if (!categoryId) {
            return res.status(400).send({ error: 'categoryId was not provided' });
        }
        if (!updateVal) {
            return res.status(400).send({ error: 'updateVal was not provided' });
        }
        const filter = { _id: categoryId };
        const update = { name: updateVal, slug: slugify(updateVal) };
        let doc = await categoryModel.findOneAndUpdate(filter, update);
        if (doc) {
            res.status(201).send({
                success: true,
                message: "record updated successfully"
            });
        }
        else {
            res.status(301).send({
                success: false,
                message: "unabm=le to update records"
            });
        }
    }

    catch (error) {
        console.log(error);
        res.status(900).send({
            success: false,
            message: 'category not updated'
        });
    }

}

//api to provide all categories presend in categoryModel
const getAll = async (req, res) => {
    try {
        const doc = await categoryModel.find();
        res.status(200).send({
            success: true,
            message: "yet correct all",
            data: doc
        });

    }
    catch (error) {
        res.status(500).send({
            success: false,
            message: error
        });
    }
}

const getSingleCarategory = async (req, res) => {
    try {
        const { categoryName } = req.params;
        if (!categoryName) {
            return res.status(400).send({ error: 'category name was not provided' });
        }
        const category = await categoryModel.findOne({ 'slug': categoryName });
        if (category) {
            res.status(200).send({
                success: true,
                message: 'working....',
                data: category
            });
        }
        else {
            res.status(401).send({
                success: false,
                message: 'error to fetch category'
            });
        }


    }
    catch (error) {
        res.status(500).send({
            success: false,
            message: error
        });
    }
}

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedCount = await categoryModel.deleteOne({ _id: id });
        if (deletedCount.deletedCount) {
            res.status(200).send({
                success: true,
                message: 'deleted category'
            });
        }
        else{
            res.status(200).send({
                success: false,
                message: 'category not found for deletion...'
            });
        }

    }
    catch (error) {
        res.status(500).send({
            success: false,
            message: 'error to delete category'
        });
    }
}
module.exports = { categoryController, updateCategory, getAll, getSingleCarategory, deleteCategory }