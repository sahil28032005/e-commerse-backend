const reviewsSchema = require('../models/reviewsAndRatings');
const orderSchema = require('../models/orderSchema');
const productSchema = require('../models/productSchema');
//all controllers for reviews handlers

//create review
const createReview = async (req, res) => {
  try {
    const { userId, review, rating, pId } = req.body;

    //before creating review check weather user actually buiyed that particular product
    const [userDspecificorders] = await orderSchema.find({ user: userId }).populate('orders');
    console.log("users orders details found", userDspecificorders.orders);
    if (!userDspecificorders || !userDspecificorders.orders || userDspecificorders.orders.length === 0) {
      return res.status(400).send({
        success: false,
        message: 'No orders found for this user',
        isBought: false
      });
    }
    const boughtProducts = userDspecificorders?.orders.map(order => order.product);
    console.log("baught", boughtProducts);
    const weatherBuyedOrNot = boughtProducts.some(id => id.equals(pId));
    if (weatherBuyedOrNot) {
      console.log("bought already!");
    } else {
      return res.status(301).send({
        success: false,
        message: 'Buy the product first and then provide ratings',
        isBought: false
      });
    }

    //at this stage there is conformation of user buiyed that productactually so he can provide her trur ratings

    const reviewEntry = new reviewsSchema({
      user: userId,
      reviewText: review,
      starRating: rating,
      product: pId
    });
    await reviewEntry.save();

    // Update the product with the new review
    const product = await productSchema.findById(pId).populate('totalReviews');
    if (product) {
      product.reviews.push(review._id);
    }
    res.status(201).send({
      success: true,
      message: 'review added successfully'
    });
  }
  catch (err) {
    res.status(500).send({ success: false, message: err.message });
  }
}
module.exports = { createReview };
