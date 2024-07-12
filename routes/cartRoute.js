const express = require('express');
const router = express.Router();
const {addToCart,getCartItems,getSpecific,deleteFromCart} = require('../controller/cartController.js');
//router for adding items inside cart
router.post("/add-to-cart", addToCart);
//route for getting all products inside cart
router.get("/get-all/:uId",getCartItems);
//route for providing cart items as per ids
router.post("/get-per-id",getSpecific);
//route for deletion of product from cart
router.post("/delete",deleteFromCart);
module.exports = router;