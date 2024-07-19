var express = require('express');
const { getParticularPhoto, getSessionDetails, sessionManager, searchThroughKeyword, getSimilarAsPerCatIds, productController, getAllproducts, getSingleProduct, getPhoto, deleteProduct, updateProduct, filterProducts, getCount, getProducts, similarProducts, getClientToken, makePayment } = require('../controller/productController');
const router = express.Router();
const formidable = require('express-formidable');
const path = require("node:path");
//multer configutrations
const multer = require("multer");
const destination = path.join(__dirname, "../uploads");

// all configurations for multer middleware
const storageConfig = multer.diskStorage({
    // destinations is uploads folder 
    // under the project directory
    destination: destination,
    filename: (req, file, res) => {
        // file name is prepended with current time
        // in milliseconds to handle duplicate file names
        res(null, Date.now() + "-" + file.originalname);
    },
});
const fileFilterConfig = function (req, file, cb) {
    if (file.mimetype === "image/jpeg"
        || file.mimetype === "image/png" || file.mimetype === "video/mp4") {
        // calling callback with true
        // as mimetype of file is image
        cb(null, true);
    } else {
        // false to indicate not to store the file
        cb(null, false);
    }
};
const upload = multer({
    // applying storage and file filter
    storage: storageConfig,
    // limits: {
    //     // limits file size to 5 MB
    //     fileSize: 1024 * 1024 * 5
    // },
    fileFilter: fileFilterConfig,
});
//all apis related to product are here

//api for create product
router.post('/create-product', /*formidable()*/upload.array('file', 10), productController);

//rpute for get all products
router.get('/get-all/:offset', getAllproducts);

//route for getting single product
router.get('/get/:id', getSingleProduct);

//route for getting photo
router.get('/get-photo/:id', getPhoto);

//route for deleting the product
router.delete('/delete/:slug', deleteProduct);

//route for updating the product according to its id
router.put('/update-product/:id', formidable(), updateProduct);

//route for filtering products
router.post('/filter', filterProducts);
//route for getting count of products
router.get('/get-count', getCount);
//get products as per page no
router.get('/get-products/:page', getProducts);
//router for providing similar products
router.get('/get-similar/:pId', similarProducts);

//routes related to brainTree
//route for generating client token
router.get("/client-token", getClientToken);
//route for making payment and generate transaction id based on it
router.post("/make-payment", makePayment);
//get similar as per catIds
router.post("/get-similar-id", getSimilarAsPerCatIds);
//for searching product using regular expressions
router.get("/search/:keyword", searchThroughKeyword);
//stripe endpoints
router.post("/stripe-pay", sessionManager);
//route for retrive payment session details
router.get("/get-session/:sessionId", getSessionDetails);
//route for getting particular photo
router.get("/get-particular-photo/:identifier/:id", getParticularPhoto);
module.exports = router;
