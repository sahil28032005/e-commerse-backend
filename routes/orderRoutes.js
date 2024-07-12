const express = require('express');
const router = express.Router();
const {getAllOrders,cancelOrder,getReturnedOrder,transactionController} = require('../controller/orderController.js');
//route for getting all orders
router.get("/getAll-orders/:userId",getAllOrders);
//route for returning products as an order
router.delete("/return-order/:userId/:productId/:returnQuantity",cancelOrder);
//route for displaying cacelled orders
router.get("/returned-order/:userId",getReturnedOrder);
//route fro creatioon user transaction details 
router.post('/add-transaction', transactionController);
module.exports = router;