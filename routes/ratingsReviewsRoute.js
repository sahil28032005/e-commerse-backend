const express = require('express');
const router = express.Router();
const {createReview}=require('../controller/reviewsController');
//all routes related to the revies and  ratings section
router.post("/create-review", createReview);

module.exports = router;