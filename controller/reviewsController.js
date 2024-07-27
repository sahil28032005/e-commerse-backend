const reviewsSchema = require('../models/reviewsAndRatings');
const orderSchema = require('../models/orderSchema');
const productSchema = require('../models/productSchema');
const mongoose = require('mongoose');
//all controllers for reviews handlers

//create review
const createReview = async (req, res) => {
  try {
    const { userId, review, rating, pId } = req.body;

    //before creating review check weather user actually buiyed that particular product
    const [userDspecificorders] = await orderSchema.find({ user: userId });
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
    console.log("review added successfully");
    // Update the product with the new review means push review id inside product
    // 1)find the product first whose ratings you wanna add
    const product = await productSchema.findById(pId).populate('reviews');
    // console.log("product found successfully"); herer we have found product whose review we wanna add
    await product.reviews.push(reviewEntry._id);
    //also increase revuiew count as new review pushed into oarticular priduct
    await product.updateOne({ $inc: { reviewsTotal: 1 } });
    console.log("review count increased");
    await product.save();
    console.log("review linked with partiular product");
    //at this stage review id linked with particula product
    // 2)find particular product with particular starts and multiply them with theire response factor as: 4:4*total 4 response
    // const thressStartRes = await product.response.reviews.map((review) => {
    //   return review.starRating == 3
    // });
    const starRatings = await productSchema.aggregate([{
      $match: { _id: new mongoose.Types.ObjectId(pId) }
    }, {
      $lookup:
      {
        from: 'reviews',
        localField: 'reviews',
        foreignField: '_id',
        as: 'reviewsForeign'
      }
    }, {
      $unwind: '$reviewsForeign'
    }, { $project: { "reviewsForeign": 1 } }, {
      $facet: {
        oneStar: [{ $match: { "reviewsForeign.starRating": 1 } }, { $count: "oneStarRatingsRecords" }],
        twoStar: [{ $match: { "reviewsForeign.starRating": 2 } }, { $count: "twoStarRatingsRecords" }],
        threeStar: [{ $match: { "reviewsForeign.starRating": 3 } }, { $count: "threeStarRatingsRecords" }],
        fourStar: [{ $match: { "reviewsForeign.starRating": 4 } }, { $count: "fourStarRatingsRecords" }],
        fiveStar: [{ $match: { "reviewsForeign.starRating": 5 } }, { $count: "fiveStarRatingsRecords" }],
      }
    }]);
    console.log("review having three star", starRatings[0].threeStar);
    //return necessary dara as:
    // 1)total review
    //2)average of all
    //3)particular review score
    //4)text reviews

    //getting individual values
    const counts = starRatings[0]; // Access the first element of the result array
    const oneStarCount = counts.oneStar.length > 0 ? counts.oneStar[0].oneStarRatingsRecords : 0;
    const twoStarCount = counts.twoStar.length > 0 ? counts.twoStar[0].twoStarRatingsRecords : 0;
    const threeStarCount = counts.threeStar.length > 0 ? counts.threeStar[0].threeStarRatingsRecords : 0;
    const fourStarCount = counts.fourStar.length > 0 ? counts.fourStar[0].fourStarRatingsRecords : 0;
    const fiveStarCount = counts.fiveStar.length > 0 ? counts.fiveStar[0].fiveStarRatingsRecords : 0;

    // Calculate the average total count
    const totalRatingsCount = oneStarCount + twoStarCount + threeStarCount + fourStarCount + fiveStarCount;
    const weightedSum = (1 * oneStarCount) + (2 * twoStarCount) + (3 * threeStarCount) + (4 * fourStarCount) + (5 * fiveStarCount);
    const averageRating = totalRatingsCount > 0 ? (weightedSum / totalRatingsCount).toFixed(1) : 0;

    console.log({
      oneStarCount,
      twoStarCount,
      threeStarCount,
      fourStarCount,
      fiveStarCount,
      averageRating
    });

    //return response from api as an frontend supplier
    return res.status(201).send({
      success: true,
      individualRating: { one: oneStarCount, two: twoStarCount, three: threeStarCount, four: fourStarCount, five: fiveStarCount },
      totalRatings: totalRatingsCount,
      averageRating: averageRating,
      totalReviews: product.reviews
    });


  }
  catch (err) {
    res.status(500).send({ success: false, message: err.message });
  }
}
module.exports = { createReview };
