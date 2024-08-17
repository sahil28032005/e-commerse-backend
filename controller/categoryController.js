const { subCat, cat } = require('../models/categorySchema');
const productSchema = require('../models/productSchema');
const { client } = require('../config/redisClient');
var slugify = require('slugify')
//for creating category
const categoryController = async (req, res) => {

    try {
        // res.send("success...");
        //try creating sub cat first and then append it inside mainc category if not already exists

        const { categoryName, subCatName, reviewsCategory } = req.body;
        const subCatRec = new subCat({
            name: subCatName,
            reviewsCategory: reviewsCategory,

        });

        const existingCategory = await cat.findOne({ name: categoryName });
        if (!existingCategory) {
            await subCatRec.save();
            console.log("subCategory saved");
            const record = new cat({
                name: categoryName,
                slug: slugify(categoryName),
                subCategories: [subCatRec]
            });
            await record.save();
            // console.log("category inserted in database");
            res.status(200).send({
                success: true,
                message: 'category inserted successfully after role identification....',
                slug: slugify(categoryName)
            });
        }
        else {
            //in this block category already exists just push sub category if it not exists
            //check weather arrived sub category already present or not
            const subCategoryPresence = existingCategory.subCategories.some(sub => sub.name === subCatName);
            if (subCategoryPresence) {
                //sub category present dont need to do anything
                console.log("sub category alredy present");
            }
            else {
                //append subcategory inside array
                await subCatRec.save();
                existingCategory.subCategories.push(subCatRec);
                await existingCategory.save();
                console.log("sub category pushed it existing catrgory");
            }
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
        let doc = await cat.findOneAndUpdate(filter, update);
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

//api to provide all categories presend in cat
const getAll = async (req, res) => {
    try {
        const cacheKey = 'allCategories';
        //check data is alerady present in cache
        const cachedData = await client.get(cacheKey);
        if (cachedData) {
            console.log("found in cache");
            return res.status(200).send({
                success: true,
                message: 'data found in cache',
                data: JSON.parse(cachedData)
            });
        }

        //if not present in cache fetch form mongo
        console.log("as it is first time fetching from database....");
        const doc = await cat.find();
        await client.set(cacheKey, JSON.stringify(doc), {
            EX: 3600 // Cache expiration time in seconds (1 hour)
        });
        return res.status(200).send({
            success: true,
            message: "yet correct all",
            data: doc
        });

    }
    catch (error) {
        res.status(500).send({
            success: false,
            message: error.message
        });
    }
}

const getSingleCarategory = async (req, res) => {
    try {
        const { categoryName } = req.params;
        if (!categoryName) {
            return res.status(400).send({ error: 'category name was not provided' });
        }
        const category = await cat.findOne({ 'slug': categoryName });
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
        const deletedCount = await cat.deleteOne({ _id: id });
        if (deletedCount.deletedCount) {
            res.status(200).send({
                success: true,
                message: 'deleted category'
            });
        }
        else {
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

const getProductsByCategory = async (req, res) => {
    try {
        const categories = await cat.find();
        const categoryWiseProducts = {};

        for (const category of categories) {
            const products = await productSchema.find({ category: category._id }).limit(6);
            // console.log("products iteration", products);
            categoryWiseProducts[category.name] = products;
        }
        res.status(200).send({
            success: true,
            message: 'data detched category wise',
            data: categoryWiseProducts
        });
    }
    catch (error) {
        res.status(500).send({
            success: false,
            message: 'Error while fetching category-wise products',
            error: error.message
        });
    }
}
module.exports = { categoryController, updateCategory, getAll, getSingleCarategory, deleteCategory, getProductsByCategory }