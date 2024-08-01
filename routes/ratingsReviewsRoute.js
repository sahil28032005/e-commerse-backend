const express = require('express');
const router = express.Router();
const path = require('path');
const { createReview, getReviewsInformations } = require('../controller/reviewsController');

//mukter imports
const multer = require('multer')
const upload = multer({
    dest: path.join(__dirname, '../uploads')
});
//all routes related to the revies and  ratings section
router.post("/create-review", upload.single('imageFromCust'), createReview);
//get all data related to the revies and ratings section
router.get("/reviews-informations/:pId", getReviewsInformations);
module.exports = router;