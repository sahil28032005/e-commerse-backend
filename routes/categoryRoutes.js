const express = require('express');
const { verifierJwt, userPreviladgeChk } = require('../middlewares/verifierMiddle');
const router = express.Router();
const { categoryController, updateCategory, getAll, getSingleCarategory, deleteCategory,getProductsByCategory } = require('../controller/categoryController');
//all routes for category

//router for creating category
// router.post("/create", verifierJwt, userPreviladgeChk, categoryController);
router.post("/create", categoryController);

//route for updating categories
router.post("/update/:categoryId", verifierJwt, userPreviladgeChk, updateCategory);

//rpute for getting all categories
router.get("/get", getAll);

//route for getting single carategory
router.get("/single/:categoryName", getSingleCarategory);

//route for deleting category through id
router.delete("/delete/:id",  deleteCategory);

//router for homapage to fetch data for category
router.get('/get-products-by-category', getProductsByCategory);

module.exports = router;