const express = require('express');
const router = express.Router();
const {getTransactions} = require('../controller/transactionController.js');
//route for providing whole transaction history
router.get("/get-transaction-details/:uid",getTransactions);
//route for payment confirmation as well as uodate payment status with transaction id assignment
module.exports = router;
