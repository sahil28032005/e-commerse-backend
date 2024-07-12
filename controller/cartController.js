const cartSchema = require("../models/cartSchema");
const productSchema = require("../models/productSchema");

const addToCart = async (req, res) => {
    try {
        const { userId, productId } = req.body;
        let userCart = await cartSchema.findOne({ userId: userId });
        if (userCart) {
            const productIndex = userCart.products.findIndex(p => p.productId == productId);
            if (productIndex > -1) {
                userCart.products[productIndex].quantity += 1;
                await userCart.save();
                res.status(200).send({
                    success: true,
                    message: 'product already exists quantity increased'
                });
            }
            else {
                userCart.products.push({ productId: productId, quantity: 1 });
                await userCart.save();
                res.status(200).send({
                    success: true,
                    message: 'product added inside cart'
                });
            }

        }
        else {
            const entry = new cartSchema({ userId: userId, products: [{ productId, quantity: 1 }] });
            await entry.save();
            res.status(200).send({
                success: true,
                message: 'users cart created and inserted their first cart product'
            });
        }
    }
    catch (error) {
        res.status(501).send({
            success: false,
            message: 'problem for adding values inside cart',
            error: error.message
        });
    }
}
//for getting all cart items
const getCartItems = async (req, res) => {
    try {
        const userId = req.params.uId;
        const cart = await cartSchema.find({ userId: userId }).populate('userId').populate('products');
        // console.log(userId);
        if (cart) {
            res.status(200).send({
                success: true,
                message: 'cart found',
                data: cart
            });
        }
        else {
            res.status(404).send({ success: false, message: 'error for getting all cart items' });
        }
    }
    catch (error) {
        res.status(501).send({
            success: false,
            messgae: 'problem for getting all cart items'
        });
    }
}
//geting id based cart specific items from products schema
const getSpecific = async (req, res) => {
    try {
        const productIds = req.body.productIds;
        // console.log("pids", productIds);
        const products = await productSchema.find({ _id: productIds }).select(['-photo']);
        if (products) {
            res.status(200).send({
                success: true,
                message: 'products found',
                data: products
            });
        }
        else {
            res.status(501).send({
                success: false,
                messgae: 'problem for getting cart specific items'
            });
        }
    }
    catch (error) {
        res.status(501).send({
            success: false,
            messgae: 'problem for getting all cart specific items'
        });
    }

}
//controller for deletion from cart
const deleteFromCart = async (req, res) => {
    try {
        const id = req.body.identifier;//for finding cart based on particular user
        const pId = req.body.productId;//product id whose gonna deletedd from cart as item
        // const pidArr=req.body.pidArr;
        // console.log("useerid", id, "productId", pId);
        // console.log("inside delete method");
        const cart = await cartSchema.findOne({ userId: id }).populate('userId').populate('products');
        if (cart) {
            // console.log("cart found");
            const filteredProducts = cart.products.filter(product => {
                return product.productId != pId
            });
            if (filteredProducts.length != cart.products.length) {
                cart.products = filteredProducts;
                cart.save();
                res.status(201).send({
                    success: true,
                    messgae: 'item successfully deleted from cart'
                });
                return;
            }
            else {
                res.status(201).send({
                    success: true,
                    messgae: 'item not found for deletion'
                });
                return;

            }


        }
        else {
            res.status(501).send({
                success: false,
                messgae: 'problem for deletion for cart product from api'
            });
            return;
        }
    }
    catch (error) {
        res.status(501).send({
            success: false,
            messgae: 'problem for deleting item',
            error: error.message
        });
    }
}
module.exports = { addToCart, getCartItems, getSpecific, deleteFromCart };