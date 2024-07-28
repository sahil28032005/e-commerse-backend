const express = require('express');
const router = express.Router();
const {createReview,getReviewsInformations}=require('../controller/reviewsController');
//all routes related to the revies and  ratings section
router.post("/create-review", createReview);
//get all data related to the revies and ratings section
router.get("/reviews-informations/:pId", getReviewsInformations);
module.exports = router;