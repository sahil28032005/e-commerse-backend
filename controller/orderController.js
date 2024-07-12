const orderSchema = require('../models/orderSchema');
const productSchema = require('../models/productSchema');

//for getting all orders
const getAllOrders = async (req, res) => {
    try {
        //logic for getting all orders
        const { userId } = req.params;
        // console.log("userId", userId);
        const order = await orderSchema.find({ user: userId }).populate({
            path: 'orders.product',
            select: '-photo -photos'
        });
        if (order) {
            res.status(201).send({
                success: true,
                message: 'order data found',
                data: order
            });
        }
        else {
            res.status(404).send("user not found");
        }
    }
    catch (exception) {
        res.status(401).send({
            success: false,
            message: 'cannot get all orders',
            error: exception.message
        });
    }
}

const cancelOrder = async (req, res) => {
    try {
        const { userId, productId, returnQuantity } = req.params;
        // console.log("userId: " + userId + ", productId:", productId);
        //arriving successfully
        const userSession = await orderSchema.find({ user: userId });
        if (!userSession) {
            return res.status(404).json({ message: 'Order not found' });
        }
        // res.status(200).json({ data: userSession });
        const index = userSession[0].orders.findIndex(item => item.product.toString() === productId);
        if (index === -1) {
            return res.status(404).json({ message: 'Product not found in any order' });
        }
        //now we have returned quantitiy we need to plus it again so again remaining customers can buy it
        // console.log("found index: " + index);
        const order = userSession[0];
        const ordersArray = order.orders;
        //befoer splice try to add returned products
        const updatedProduct = await productSchema.findByIdAndUpdate(productId, { $inc: { quantity: returnQuantity } }, { new: true });
        const removed = ordersArray.splice(index, 1);
        removed.status = 'returned';
        if (!order.cancelledProducts) {
            order.cancelledProducts = [];
        }
        //pushing cancelled item in returned layer
        order.cancelledProducts.push(removed[0].product);
        order.save();
        // console.log("removed order: ", removed);
        res.status(200).json({
            message: 'Product cancelled successfully',
            data: order
        });
    }
    catch (exception) {
        res.status(403).send({
            success: false,
            message: 'error while returning product information',
            message: exception.message
        });
    }
}
//controller for getting returned products
const getReturnedOrder = async (req, res) => {
    try {
        const { userId } = req.params;
        // console.log("userId", userId);
        const userDetails = await orderSchema.find({ user: userId }).populate({
            path: 'cancelledProducts',
            select: '-photo -photos' // Exclude the 'photo' field from 'cancelledProducts'
        });
        if (userDetails) {
            res.status(200).send({
                total: userDetails.length,
                success: true,
                message: 'found cancelled items succeffully',
                data: userDetails
            });
        }
        else {
            // console.log("order session for user is not found in schema");
        }
    }
    catch (exception) {
        res.status(403).send({
            success: false,
            message: 'problem for displaying returned products',
            error: exception.message
        });
    }
}
//to  maintain transaction histories
const transactionController = async (req, res) => {
    try {
        
    }
    catch (exception) {
        res.status(403).send({
            success: false,
            message: 'problem for successful transaction',
            error: exception.message
        });
    }
}
module.exports = { getAllOrders, cancelOrder, getReturnedOrder, transactionController };
